import { use$ } from "@legendapp/state/react";
import { persons$ } from "@/state/persons";
import { households$ } from "@/state/households";
import { communities$ } from "@/state/communities";
import { districts$ } from "@/state/districts";
import { regions$ } from "@/state/regions";
import type { PersonAllLocation } from "@/utils/types/person";

export function useAllPersons(householdId?: string) {
  // Read all location and entity observables reactively
  const personsData = use$(persons$) || {};
  const householdsData = use$(households$) || {};
  const communitiesData = use$(communities$) || {};
  const districtsData = use$(districts$) || {};
  const regionsData = use$(regions$) || {};

  // Enrich persons with location data reactively
  // Note: No useMemo needed - LegendApp's observer handles reactivity
  const enrichedPersons = Object.values(personsData)
    .filter((p: any) => !p.deleted_at)
    .filter((p: any) => (householdId ? p.household_id === householdId : true))
    .map((person: any): PersonAllLocation => {
      const household = person.household_id
        ? householdsData[person.household_id]
        : null;
      const community = household?.community_id
        ? communitiesData[household.community_id]
        : null;
      const district = community?.district_id
        ? districtsData[community.district_id]
        : null;
      const region = district?.region_id
        ? regionsData[district.region_id]
        : null;

      return {
        ...person,
        household,
        community,
        district,
        region,
      };
    })
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  return enrichedPersons;
}
