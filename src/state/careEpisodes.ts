import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CareEpisode } from "@/utils/types/careEpisode";

const STORAGE_KEY = "care_episodes_local";

export const careEpisodes$ = observable<Record<string, CareEpisode>>({});
export const isCareEpisodesSyncing$ = observable(false);
export const careEpisodesLastSyncTime$ = observable<string | null>(null);

careEpisodes$.onChange(async () => {
  try {
    const data = careEpisodes$.get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[CareEpisodes State] Error saving to storage:", error);
  }
});

export function setCareEpisodesSyncing(syncing: boolean) {
  isCareEpisodesSyncing$.set(syncing);
}

export function setCareEpisodesLastSync(timestamp: string) {
  careEpisodesLastSyncTime$.set(timestamp);
}

export function getCareEpisodesByPerson(personId: string): CareEpisode[] {
  const all = careEpisodes$.get();
  if (!all) return [];
  return Object.values(all).filter(
    (e) => e.person_id === personId && !e.deleted_at,
  );
}

export function getActiveCareEpisode(personId: string): CareEpisode | null {
  const all = careEpisodes$.get();
  if (!all) return null;
  return (
    Object.values(all).find(
      (e) => e.person_id === personId && e.status === "ACTIVE" && !e.deleted_at,
    ) || null
  );
}
