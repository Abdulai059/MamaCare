import { use$ } from "@legendapp/state/react";
import { careEpisodes$, isCareEpisodesSyncing$ } from "@/state/careEpisodes";
import { createCareEpisode } from "@/services/careEpisodes.operations";
import { syncCareEpisodesToSupabase } from "@/services/sync/careEpisodes.sync";
import {
  selectCareEpisodesByPerson,
  selectActiveCareEpisode,
} from "@/selectors/careEpisodes/careEpisode.selectors";
import type { CareEpisode } from "@/utils/types/careEpisode";

export function useCareEpisodes(personId: string) {
  const episodes = use$(careEpisodes$) || {};
  const isSyncing = use$(isCareEpisodesSyncing$) || false;

  const episodeList = selectCareEpisodesByPerson(
    episodes as Record<string, CareEpisode>,
    personId,
  ).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  const activeEpisode = selectActiveCareEpisode(
    episodes as Record<string, CareEpisode>,
    personId,
  );

  return {
    episodeList,
    activeEpisode,
    isSyncing,
    createCareEpisode,
    selectCareEpisodesByPerson,
    syncNow: syncCareEpisodesToSupabase,
  };
}
