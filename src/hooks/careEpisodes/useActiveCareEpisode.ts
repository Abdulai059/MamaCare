import { use$ } from "@legendapp/state/react";
import { careEpisodes$ } from "@/state/careEpisodes";
import { selectActiveCareEpisode } from "@/selectors/careEpisodes/careEpisode.selectors";
import type { CareEpisode } from "@/utils/types/careEpisode";

export function useActiveCareEpisode(personId: string) {
  const careEpisodes = use$(careEpisodes$) || {};
  const activeEpisode = selectActiveCareEpisode(
    careEpisodes as Record<string, CareEpisode>,
    personId,
  );

  return activeEpisode;
}
