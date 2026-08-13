import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import {
  persons$,
  isSyncing$,
  setPersonsSyncing,
  setPersonsLastSync,
} from "@/state/persons";
import { households$ } from "@/state/households";
import { offlineSyncManager } from "@/services/offlineSync";
import type { Person } from "@/utils/types/person";

const STORAGE_KEY = "persons_local";
const FK_VIOLATION = "23503";
const INVALID_DATE_FORMAT = "22007";

type SyncOutcome = "synced" | "skipped" | "failed";

// =========================================================
// HELPERS
// =========================================================

function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function syncInBackground() {
  syncPersonsToSupabase().catch((error) => {
    console.error("[Persons] Background sync error:", error);
  });
}

// =========================================================
// 1. BOOT & HYDRATION (Storage + Remote Pull)
// =========================================================

export async function loadPersonsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: Record<string, Person> = JSON.parse(stored);

    // Clean up any legacy items with invalid dates
    const cleaned = Object.entries(data).reduce(
      (acc, [id, person]) => {
        acc[id] = isValidDateFormat(person.date_of_birth)
          ? person
          : { ...person, date_of_birth: null };
        return acc;
      },
      {} as Record<string, Person>,
    );

    persons$.set(cleaned);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch (error) {
    console.error("[Persons] Storage load error:", error);
  }
}

/** Pulls remote persons belonging to local households down from Supabase */
export async function getPersons() {
  try {
    const householdIds = Object.keys(households$.get() ?? {});
    if (householdIds.length === 0) return;

    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .in("household_id", householdIds);

    if (error) {
      console.error("[Persons] Error fetching from Supabase:", error);
      return;
    }

    if (data) {
      const currentLocal = persons$.get() ?? {};
      const updatedMap: Record<string, Person> = { ...currentLocal };

      data.forEach((remotePerson) => {
        const local = currentLocal[remotePerson.id];

        // Safe merge: Don't overwrite if local record has unsynced changes
        if (!local || local._syncState === "synced") {
          updatedMap[remotePerson.id] = {
            ...remotePerson,
            _synced: true,
            _syncedDelete: !!remotePerson.deleted_at,
            _syncState: "synced",
          };
        }
      });

      persons$.set(updatedMap);
      setPersonsLastSync(new Date().toISOString());
    }
  } catch (error) {
    console.error("[Persons] Fetch exception:", error);
  }
}

// =========================================================
// 2. PUSH / SYNC (Local State -> Supabase)
// =========================================================

async function syncSinglePerson(
  id: string,
  person: Person,
): Promise<SyncOutcome> {
  const isDelete = Boolean(person.deleted_at) && !person._syncedDelete;
  const isUpsert = !person.deleted_at && !person._synced;

  if (!isDelete && !isUpsert) return "synced";

  const action = isDelete ? "delete" : "upsert";
  persons$[id]._syncState?.set?.("syncing");

  const query = isDelete
    ? supabase
        .from("persons")
        .update({ deleted_at: person.deleted_at })
        .eq("id", id)
    : supabase.from("persons").upsert({
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

  const { error } = await query;

  if (!error) {
    if (isDelete) {
      persons$[id]._syncedDelete.set(true);
    } else {
      persons$[id]._synced.set(true);
    }
    persons$[id]._syncState?.set?.("synced");
    return "synced";
  }

  // Handle errors gracefully
  if (error.code === FK_VIOLATION) {
    return "skipped"; // Wait for parent household sync
  }

  if (error.code === INVALID_DATE_FORMAT) {
    console.warn(`[Persons] Invalid date for ${id}, clearing...`);
    persons$[id].set({ ...person, date_of_birth: null, _synced: false });
    return "failed";
  }

  persons$[id]._syncState?.set?.("failed");
  console.error(`[Persons] Failed to ${action} ${id}:`, error);
  return "failed";
}

export async function syncPersonsToSupabase() {
  if (isSyncing$.get()) return;

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
    console.error("[Persons] Error during sync:", error);
  } finally {
    setPersonsSyncing(false);
  }
}

// =========================================================
// 3. MUTATIONS & QUERIES (UI interface)
// =========================================================

export async function createPerson(data: {
  household_id: string;
  first_name: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: "MALE" | "FEMALE";
  phone?: string;
  preferred_language?: string;
}) {
  const id = uuidv4();
  const now = new Date().toISOString();

  const dob =
    data.date_of_birth && isValidDateFormat(data.date_of_birth)
      ? data.date_of_birth
      : null;

  const person: Person = {
    id,
    household_id: data.household_id,
    first_name: data.first_name,
    last_name: data.last_name || null,
    date_of_birth: dob,
    gender: data.gender || null,
    phone: data.phone || null,
    preferred_language: data.preferred_language || null,
    role: "MOTHER",
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
  data: Partial<
    Pick<
      Person,
      | "first_name"
      | "last_name"
      | "date_of_birth"
      | "gender"
      | "phone"
      | "preferred_language"
    >
  >,
) {
  const current = persons$[id].get();
  if (!current) throw new Error("Person not found");

  const dob =
    data.date_of_birth && !isValidDateFormat(data.date_of_birth)
      ? null
      : data.date_of_birth;

  persons$[id].set({
    ...current,
    ...data,
    // date_of_birth: dob, // ERROR HERE 
    updated_at: new Date().toISOString(),
    _synced: false,
    _syncState: "pending",
  });

  syncInBackground();
}

export async function deletePerson(id: string) {
  const current = persons$[id].get();
  if (!current) throw new Error("Person not found");

  persons$[id].set({
    ...current,
    deleted_at: new Date().toISOString(),
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  });

  syncInBackground();
}

export function getPersonsByHousehold(householdId: string): Person[] {
  const all = persons$.get();
  if (!all) return [];
  return Object.values(all).filter(
    (p) => p.household_id === householdId && !p.deleted_at,
  );
}

// =========================================================
// 4. INITIALIZATION
// =========================================================

export async function initializePersons() {
  // 1. Fast local load
  await loadPersonsFromStorage();

  // 2. Fetch fresh remote state
  await getPersons();

  // 3. Register offline listener
  offlineSyncManager.register("persons", {
    onForeground: async () => {
      await syncPersonsToSupabase();
      await getPersons();
    },
  });

  // 4. Trigger initial push sync
  setTimeout(() => syncPersonsToSupabase(), 2000);
}
