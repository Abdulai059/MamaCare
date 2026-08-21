import { observable } from "@legendapp/state";
import type { Person } from "@/utils/types/person";

export const persons$ = observable<Record<string, Person>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

export function setPersonsSyncing(syncing: boolean) {
  isSyncing$.set(syncing);
}

export function setPersonsLastSync(timestamp: string) {
  lastSyncTime$.set(timestamp);
}
