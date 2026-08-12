import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Observable state - kept simple and pure
export const households$ = observable<Record<string, any>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

// Save to AsyncStorage whenever households change
households$.onChange(async () => {
  try {
    const data = households$.get();
    await AsyncStorage.setItem("households_local", JSON.stringify(data));
    console.log("[Households State] Saved to AsyncStorage");
  } catch (error) {
    console.error("[Households State] Error saving to storage:", error);
  }
});

// Helpers to update state from services
export function setHouseholdsSyncing(syncing: boolean) {
  isSyncing$.set(syncing);
}

export function setHouseholdsLastSync(timestamp: string) {
  lastSyncTime$.set(timestamp);
}
