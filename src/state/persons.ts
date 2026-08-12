import { observable } from "@legendapp/state";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

export type PersonRole =
  | "MOTHER"
  | "CHILD"
  | "CAREGIVER"
  | "CHPS_WORKER"
  | "SUPERVISOR"
  | "ADMIN";

// Simple in-memory observable
export const persons$ = observable<Record<string, any>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

let syncTimeout: NodeJS.Timeout | null = null;
let appState = AppState.currentState;

// Monitor when app comes to foreground
function setupAppStateListener() {
  const subscription = AppState.addEventListener("change", handleAppStateChange);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    console.log("[Persons] App state:", appState, "→", nextAppState);

    if (appState.match(/inactive|background/) && nextAppState === "active") {
      console.log("[Persons] App in foreground, attempting sync...");
      setTimeout(() => syncPersonsToSupabase(), 500);
    }

    appState = nextAppState;
  }

  return subscription;
}

// Load from AsyncStorage
export async function loadPersonsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem("persons_local");
    if (stored) {
      const data = JSON.parse(stored);
      persons$.set(data);
      console.log("[Persons] Loaded from storage:", Object.keys(data).length, "items");
    }
  } catch (error) {
    console.error("[Persons] Error loading from storage:", error);
  }
}

// Save to AsyncStorage
persons$.onChange(async () => {
  try {
    const data = persons$.get();
    await AsyncStorage.setItem("persons_local", JSON.stringify(data));
    console.log("[Persons] Saved to AsyncStorage");
  } catch (error) {
    console.error("[Persons] Error saving to storage:", error);
  }
});

// Sync to Supabase
async function syncPersonsToSupabase() {
  if (isSyncing$.get()) {
    console.log("[Persons] Sync already in progress, skipping");
    return;
  }

  isSyncing$.set(true);
  console.log("[Persons] Starting sync to Supabase...");

  try {
    // IMPORTANT: Only sync persons if their households have been synced
    // to avoid foreign key constraint violations
    const allPersons = Object.entries(persons$.get() || {});
    let syncedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const [id, person] of allPersons) {
      const p = person as any;

      try {
        if (p.deleted_at && !p._syncedDelete) {
          // Soft delete
          console.log("[Persons] Syncing delete:", id);
          const { error } = await supabase
            .from("persons")
            .update({ deleted_at: p.deleted_at })
            .eq("id", id);

          if (!error) {
            persons$[id]._syncedDelete.set(true);
            syncedCount++;
            console.log("[Persons] ✅ Synced delete:", id);
          } else if (error?.code === "23503") {
            // Foreign key error - household not synced yet, skip for now
            console.log("[Persons] ⏭️ Skipping (household not synced yet):", id);
            skippedCount++;
          } else {
            failedCount++;
            console.error("[Persons] ❌ Failed to sync delete:", id, error);
          }
        } else if (!p.deleted_at && !p._synced) {
          // Insert or update
          console.log("[Persons] Syncing:", id);
          const { error } = await supabase.from("persons").upsert({
            id: p.id,
            household_id: p.household_id,
            first_name: p.first_name,
            last_name: p.last_name,
            date_of_birth: p.date_of_birth,
            gender: p.gender,
            phone: p.phone,
            preferred_language: p.preferred_language,
            role: p.role,
            created_at: p.created_at,
            updated_at: p.updated_at,
          });

          if (!error) {
            persons$[id]._synced.set(true);
            syncedCount++;
            console.log("[Persons] ✅ Synced:", id);
          } else if (error?.code === "23503") {
            // Foreign key error - household not synced yet, skip for now
            console.log("[Persons] ⏭️ Skipping (household not synced yet):", id);
            skippedCount++;
          } else {
            failedCount++;
            console.error("[Persons] ❌ Failed to sync:", id, error);
          }
        }
      } catch (error: any) {
        if (error?.code === "23503") {
          console.log("[Persons] ⏭️ Skipping (household not synced yet):", id);
          skippedCount++;
        } else {
          failedCount++;
          console.error("[Persons] ❌ Error syncing person", id, error);
        }
      }
    }

    lastSyncTime$.set(new Date().toISOString());
    console.log(
      `[Persons] Sync complete: ${syncedCount} synced, ${skippedCount} skipped (waiting for households), ${failedCount} failed`,
    );

    // If there are skipped persons (waiting for households), retry in 2 seconds
    if (skippedCount > 0) {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        console.log("[Persons] Retrying skipped syncs (households may now be synced)...");
        syncPersonsToSupabase();
      }, 2000);
    } else if (failedCount > 0) {
      // Only retry real failures (not FK issues) after 5 seconds
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        console.log("[Persons] Retrying failed syncs...");
        syncPersonsToSupabase();
      }, 5000);
    }
  } catch (error) {
    console.error("[Persons] Error during sync:", error);
  } finally {
    isSyncing$.set(false);
  }
}

export async function initializePersons() {
  console.log("[Persons] Initializing...");

  setupAppStateListener();
  await loadPersonsFromStorage();

  setTimeout(() => syncPersonsToSupabase(), 2000);
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

  const person = {
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
  };

  persons$[id].set(person);
  console.log("[Persons] Created:", id);

  syncPersonsToSupabase();
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
  const now = new Date().toISOString();
  const current = persons$[id].get();

  if (!current) {
    throw new Error("Person not found");
  }

  persons$[id].set({
    ...current,
    ...data,
    updated_at: now,
    _synced: false,
  });

  console.log("[Persons] Updated:", id);

  syncPersonsToSupabase();
}

export async function deletePerson(id: string) {
  const now = new Date().toISOString();
  const current = persons$[id].get();

  if (!current) {
    throw new Error("Person not found");
  }

  persons$[id].set({
    ...current,
    deleted_at: now,
    _synced: false,
    _syncedDelete: false,
  });

  console.log("[Persons] Deleted:", id);

  syncPersonsToSupabase();
}

export function getPersonsByHousehold(householdId: string) {
  const all = persons$.get();
  if (!all) return [];
  return Object.values(all).filter(
    (p: any) => p.household_id === householdId && !p.deleted_at,
  );
}
