import {
  isSyncing$,
  setPersonsSyncing,
  setPersonsLastSync,
  persons$,
} from "@/state/persons";
import { offlineSyncManager } from "@/services/offlineSync";
import {
  upsertPersonToSupabase,
  deletePersonFromSupabase,
} from "@/repositories/persons.repository";
import type { Person } from "@/utils/types/person";

const FK_VIOLATION = "23503";
const INVALID_DATE_FORMAT = "22007";

type SyncOutcome = "synced" | "skipped" | "failed";

function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

async function syncSinglePerson(
  id: string,
  person: Person,
): Promise<SyncOutcome> {
  const isDelete = Boolean(person.deleted_at) && !person._syncedDelete;
  const isUpsert = !person.deleted_at && !person._synced;

  if (!isDelete && !isUpsert) return "synced";

  const action = isDelete ? "delete" : "upsert";
  persons$[id]._syncState?.set?.("syncing");

  try {
    if (isDelete) {
      if (!person.deleted_at) {
        throw new Error("Cannot delete person without deleted_at timestamp");
      }
      await deletePersonFromSupabase(id, person.deleted_at);
      persons$[id]._syncedDelete.set(true);
    } else {
      await upsertPersonToSupabase(person);
      persons$[id]._synced.set(true);
    }
    persons$[id]._syncState?.set?.("synced");
    return "synced";
  } catch (error: any) {
    if (error.code === FK_VIOLATION) {
      return "skipped";
    }

    if (error.code === INVALID_DATE_FORMAT) {
      console.warn(`[Persons Sync] Invalid date for ${id}, clearing...`);
      persons$[id].set({ ...person, date_of_birth: null, _synced: false });
      return "failed";
    }

    persons$[id]._syncState?.set?.("failed");
    console.error(`[Persons Sync] Failed to ${action} ${id}:`, error);
    return "failed";
  }
}

export async function syncPersonsToSupabase() {
  const isSyncing = isSyncing$.get();
  if (isSyncing) return;

  setPersonsSyncing(true);

  try {
    const allPersons = Object.entries(persons$.get() ?? {}) as [
      string,
      Person,
    ][];
    const counts: Record<SyncOutcome, number> = {
      synced: 0,
      skipped: 0,
      failed: 0,
    };

    for (const [id, person] of allPersons) {
      const outcome = await syncSinglePerson(id, person);
      counts[outcome]++;
    }

    setPersonsLastSync(new Date().toISOString());

    if (counts.skipped > 0) {
      offlineSyncManager.scheduleRetry(
        "persons-retry-fk",
        syncPersonsToSupabase,
        2000,
      );
    } else if (counts.failed > 0) {
      offlineSyncManager.scheduleRetry(
        "persons-retry",
        syncPersonsToSupabase,
        5000,
      );
    } else {
      offlineSyncManager.cancelRetry("persons-retry-fk");
      offlineSyncManager.cancelRetry("persons-retry");
    }
  } catch (error) {
    console.error("[Persons Sync] Error during sync:", error);
  } finally {
    setPersonsSyncing(false);
  }
}
