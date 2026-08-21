import { observable } from "@legendapp/state";
import type { CareEpisode } from "@/utils/types/careEpisode";

export const careEpisodes$ = observable<Record<string, CareEpisode>>({});
export const isCareEpisodesSyncing$ = observable(false);
export const careEpisodesLastSyncTime$ = observable<string | null>(null);

export function setCareEpisodesSyncing(syncing: boolean) {
  isCareEpisodesSyncing$.set(syncing);
}

export function setCareEpisodesLastSync(timestamp: string) {
  careEpisodesLastSyncTime$.set(timestamp);
}
