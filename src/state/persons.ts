import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Person } from "@/utils/types/person";

const STORAGE_KEY = "persons_local";

// Pure observable store for persons typed with Person model
export const persons$ = observable<Record<string, Person>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

// Persist to AsyncStorage whenever persons$ changes
persons$.onChange(async () => {
  try {
    const data = persons$.get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("[Persons State] Saved to AsyncStorage");
  } catch (error) {
    console.error("[Persons State] Error saving to storage:", error);
  }
});

// Helper state setters
export function setPersonsSyncing(syncing: boolean) {
  isSyncing$.set(syncing);
}

export function setPersonsLastSync(timestamp: string) {
  lastSyncTime$.set(timestamp);
}

// Query helper to retrieve persons by household
export function getPersonsByHousehold(householdId: string): Person[] {
  const all = persons$.get();
  if (!all) return [];
  return Object.values(all).filter(
    (p) => p.household_id === householdId && !p.deleted_at,
  );
}
