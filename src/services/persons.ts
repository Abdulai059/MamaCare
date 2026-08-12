import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import {
  persons$,
  isSyncing$,
  setPersonsSyncing,
  setPersonsLastSync,
  PersonRole,
} from "@/state/persons";
import { offlineSyncManager } from "@/services/offlineSync";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Person } from "@/utils/types/person";

const FK_VIOLATION = "23503"; // Postgres foreign key violation (household not synced yet)

type SyncOutcome = "synced" | "skipped" | "failed";

export async function loadPersonsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem("persons_local");
    if (stored) {
      const data = JSON.parse(stored);
      persons$.set(data);
      console.log(
        "[Persons] Loaded from storage:",
        Object.keys(data).length,
        "items",
      );
    }
  } catch (error) {
    console.error("[Persons] Error loading from storage:", error);
  }
}

/**
 * Syncs a single person's pending create/update or pending delete to Supabase.
 * Returns the outcome so the caller can tally counts and decide on retries.
 */
async function syncSinglePerson(
  id: string,
  person: Person,
): Promise<SyncOutcome> {
  const isDelete = Boolean(person.deleted_at) && !person._syncedDelete;
  const isUpsert = !person.deleted_at && !person._synced;

  if (!isDelete && !isUpsert) {
    return "synced";
  }

  const action = isDelete ? "delete" : "upsert";
  persons$[id]._syncState?.set?.("syncing");

  try {
    const { error } = isDelete
      ? await supabase
          .from("persons")
          .update({ deleted_at: person.deleted_at })
          .eq("id", id)
      : await supabase.from("persons").upsert({
          id: person.id,
          household_id: person.household_id,
          first_name: person.first_name,
          last_name: person.last_name,
          date_of_birth: person.date_of_birth,
          gender: person.gender,
          phone: person.phone,
          preferred_language: person.preferred_language,
          role: person.role,
          created_at: person.created_at,
          updated_at: person.updated_at,
        });

    if (!error) {
      if (isDelete) {
        persons$[id]._syncedDelete.set(true);
      } else {
        persons$[id]._synced.set(true);
      }
      persons$[id]._syncState?.set?.("synced");
      return "synced";
    }

    if (error.code === FK_VIOLATION) {
      return "skipped";
    }

    persons$[id]._syncState?.set?.("failed");
    console.error(`[Persons] ❌ Failed to sync ${action}:`, id, error);
    return "failed";
  } catch (error: any) {
    if (error?.code === FK_VIOLATION) {
      return "skipped";
    }
    persons$[id]._syncState?.set?.("failed");
    console.error(`[Persons] ❌ Error syncing ${action}:`, id, error);
    return "failed";
  }
}

export async function syncPersonsToSupabase() {
  if (isSyncing$.get()) {
    return;
  }

  setPersonsSyncing(true);

  try {
    const allPersons = Object.entries(persons$.get() || {}) as [
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
    console.log(
      `[Persons] Sync complete: ${counts.synced} synced, ${counts.skipped} skipped (waiting for households), ${counts.failed} failed`,
    );

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
    console.error("[Persons] Error during sync:", error);
  } finally {
    setPersonsSyncing(false);
  }
}

function syncInBackground() {
  syncPersonsToSupabase().catch((error) => {
    console.error("[Persons] Background sync error:", error);
  });
}

export async function createPerson(data: {
  household_id: string;
  first_name: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: "MALE" | "FEMALE";
  phone?: string;
  preferred_language?: string;
  role: PersonRole;
}) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const person: Person = {
    id,
    household_id: data.household_id,
    first_name: data.first_name,
    last_name: data.last_name || null,
    date_of_birth: data.date_of_birth || null,
    gender: data.gender || null,
    phone: data.phone || null,
    preferred_language: data.preferred_language || null,
    role: data.role,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  };

  persons$[id].set(person);
  syncInBackground();

  return id;
}

export async function updatePerson(
  id: string,
  data: Partial<{
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: "MALE" | "FEMALE";
    phone: string;
    preferred_language: string;
    role: PersonRole;
  }>,
) {
  const current = persons$[id].get();

  if (!current) {
    throw new Error("Person not found");
  }

  persons$[id].set({
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
    _synced: false,
    _syncState: "pending",
  });

  syncInBackground();
}

export async function deletePerson(id: string) {
  const current = persons$[id].get();

  if (!current) {
    throw new Error("Person not found");
  }

  persons$[id].set({
    ...current,
    deleted_at: new Date().toISOString(),
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  });

  syncInBackground();
}

export function getPersonsByHousehold(householdId: string) {
  const all = persons$.get();
  if (!all) return [];
  return Object.values(all).filter(
    (p: any) => p.household_id === householdId && !p.deleted_at,
  );
}

export async function initializePersons() {
  await loadPersonsFromStorage();

  offlineSyncManager.register("persons", {
    onForeground: syncPersonsToSupabase,
  });

  setTimeout(() => syncPersonsToSupabase(), 2000);
}
