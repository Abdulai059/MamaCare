import type { Person, PersonAllLocation } from "@/utils/types/person";
import type { Household } from "@/utils/types/household";
import type { Community, District, Region } from "@/utils/types/person";
import type { CareEpisode } from "@/utils/types/careEpisode";

export function enrichPersonWithLocation(
  person: Person,
  households: Record<string, Household>,
  communities: Record<string, Community>,
  districts: Record<string, District>,
  regions: Record<string, Region>,
): PersonAllLocation {
  const household = person.household_id
    ? households[person.household_id]
    : null;
  const community = household?.community_id
    ? communities[household.community_id]
    : null;
  const district = community?.district_id
    ? districts[community.district_id]
    : null;
  const region = district?.region_id ? regions[district.region_id] : null;

  return {
    ...person,
    household,
    community,
    district,
    region,
  };
}

export function enrichPersonWithCareEpisodes(
  person: Person,
  careEpisodes: Record<string, CareEpisode>,
): PersonAllLocation {
  const personCareEpisodes = Object.values(careEpisodes)
    .filter((e) => e.person_id === person.id && !e.deleted_at)
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  const activeEpisode =
    personCareEpisodes.find((e) => e.status === "ACTIVE") || null;

  const isPregnant = activeEpisode?.episode_type === "PREGNANCY";

  return {
    ...person,
    careEpisodes: personCareEpisodes,
    activeCareEpisode: activeEpisode,
    is_pregnant: isPregnant,
  };
}

export function enrichPerson(
  person: Person,
  households: Record<string, Household>,
  communities: Record<string, Community>,
  districts: Record<string, District>,
  regions: Record<string, Region>,
  careEpisodes: Record<string, CareEpisode>,
): PersonAllLocation {
  const enrichedWithLocation = enrichPersonWithLocation(
    person,
    households,
    communities,
    districts,
    regions,
  );

  return enrichPersonWithCareEpisodes(enrichedWithLocation, careEpisodes);
}

export function enrichPersons(
  persons: Record<string, Person>,
  households: Record<string, Household>,
  communities: Record<string, Community>,
  districts: Record<string, District>,
  regions: Record<string, Region>,
  careEpisodes: Record<string, CareEpisode>,
  householdId?: string,
): PersonAllLocation[] {
  return Object.values(persons)
    .filter((p) => !p.deleted_at)
    .filter((p) => (householdId ? p.household_id === householdId : true))
    .map((person) =>
      enrichPerson(
        person,
        households,
        communities,
        districts,
        regions,
        careEpisodes,
      ),
    )
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
}

export function getPersonPregnancyStatus(
  person: Person,
  careEpisodes: Record<string, CareEpisode>,
): boolean {
  const activeEpisode = Object.values(careEpisodes).find(
    (e) => e.person_id === person.id && e.status === "ACTIVE" && !e.deleted_at,
  );
  return activeEpisode?.episode_type === "PREGNANCY";
}

export function getPersonActiveEpisode(
  person: Person,
  careEpisodes: Record<string, CareEpisode>,
): CareEpisode | null {
  return (
    Object.values(careEpisodes).find(
      (e) => e.person_id === person.id && e.status === "ACTIVE" && !e.deleted_at,
    ) || null
  );
}
