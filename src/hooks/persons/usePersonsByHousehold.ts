import { use$ } from "@legendapp/state/react";
import { persons$ } from "@/state/persons";
import { selectPersonsByHousehold } from "@/selectors/persons/person.selectors";
import type { Person } from "@/utils/types/person";

export function usePersonsByHousehold(householdId: string) {
  const persons = use$(persons$) || {};
  const householdPersons = selectPersonsByHousehold(
    persons as Record<string, Person>,
    householdId,
  );

  return householdPersons;
}
