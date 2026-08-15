import { use$ } from "@legendapp/state/react";
import {
  careEpisodes$,
  isCareEpisodesSyncing$,
  getCareEpisodesByPerson,
  getActiveCareEpisode,
} from "@/state/careEpisodes";
import {
  createCareEpisode,
  syncCareEpisodesToSupabase,
} from "@/services/careEpisodes";
import type { CareEpisode } from "@/utils/types/careEpisode";

export function useCareEpisodes(personId: string) {
  const episodes = use$(careEpisodes$) || {};
  const isSyncing = use$(isCareEpisodesSyncing$) || false;

  const episodeList = Object.values(episodes as Record<string, CareEpisode>)
    .filter((e) => e.person_id === personId && !e.deleted_at)
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  const activeEpisode = getActiveCareEpisode(personId);

  return {
    episodeList,
    activeEpisode,
    isSyncing,
    createCareEpisode,
    getCareEpisodesByPerson,
    syncNow: syncCareEpisodesToSupabase,
  };
}
