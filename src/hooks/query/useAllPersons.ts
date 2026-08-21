import { use$ } from "@legendapp/state/react";
import { persons$ } from "@/state/persons";
import { households$ } from "@/state/households";
import { communities$ } from "@/state/communities";
import { districts$ } from "@/state/districts";
import { regions$ } from "@/state/regions";
import { careEpisodes$ } from "@/state/careEpisodes";
import { enrichPersons } from "@/selectors/persons/person.enrichment";
import type { PersonAllLocation } from "@/utils/types/person";

export function useAllPersons(householdId?: string): PersonAllLocation[] {
  // Read all location and entity observables reactively
  const personsData = use$(persons$) || {};
  const householdsData = use$(households$) || {};
  const communitiesData = use$(communities$) || {};
  const districtsData = use$(districts$) || {};
  const regionsData = use$(regions$) || {};
  const careEpisodesData = use$(careEpisodes$) || {};

  // Use enrichment function to combine all related data
  const enrichedPersons = enrichPersons(
    personsData,
    householdsData,
    communitiesData,
    districtsData,
    regionsData,
    careEpisodesData,
    householdId,
  );

  return enrichedPersons;
}
