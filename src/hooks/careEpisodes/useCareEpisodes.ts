import { use$ } from "@legendapp/state/react";
import {
  careEpisodes$,
  isCareEpisodesSyncing$,
  careEpisodesLastSyncTime$,
} from "@/state/careEpisodes";
import { selectActiveCareEpisodes } from "@/selectors/careEpisodes/careEpisode.selectors";
import type { CareEpisode } from "@/utils/types/careEpisode";

export function useCareEpisodes() {
  const careEpisodes = use$(careEpisodes$) || {};
  const isSyncing = use$(isCareEpisodesSyncing$) || false;
  const lastSyncTime = use$(careEpisodesLastSyncTime$) || null;

  const careEpisodesList = selectActiveCareEpisodes(
    careEpisodes as Record<string, CareEpisode>,
  ).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  return {
    careEpisodes: careEpisodes as Record<string, CareEpisode>,
    careEpisodesList,
    isSyncing,
    lastSyncTime,
  };
}
