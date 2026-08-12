import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PersonRole =
  | "MOTHER"
  | "CAREGIVER"
  | "CHPS_WORKER"


// Observable state - kept simple and pure
export const persons$ = observable<Record<string, any>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

// Save to AsyncStorage whenever persons change
persons$.onChange(async () => {
  try {
    const data = persons$.get();
    await AsyncStorage.setItem("persons_local", JSON.stringify(data));
    console.log("[Persons State] Saved to AsyncStorage");
  } catch (error) {
    console.error("[Persons State] Error saving to storage:", error);
  }
});

// Helpers to update state from services
export function setPersonsSyncing(syncing: boolean) {
  isSyncing$.set(syncing);
}

export function setPersonsLastSync(timestamp: string) {
  lastSyncTime$.set(timestamp);
}

// Query helper (kept in state since it doesn't mutate)
export function getPersonsByHousehold(householdId: string) {
  const all = persons$.get();
  if (!all) return [];
  return Object.values(all).filter(
    (p: any) => p.household_id === householdId && !p.deleted_at,
  );
}
