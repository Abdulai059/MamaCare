import { observable } from "@legendapp/state";
import type { Household } from "@/utils/types/household";

export const households$ = observable<Record<string, Household>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

export function setHouseholdsSyncing(syncing: boolean) {
  isSyncing$.set(syncing);
}

export function setHouseholdsLastSync(timestamp: string) {
  lastSyncTime$.set(timestamp);
}
