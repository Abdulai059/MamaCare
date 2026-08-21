import { use$ } from "@legendapp/state/react";
import { persons$ } from "@/state/persons";
import { selectPersonById } from "@/selectors/persons/person.selectors";
import type { Person } from "@/utils/types/person";

export function usePerson(personId: string) {
  const persons = use$(persons$) || {};
  const person = selectPersonById(persons as Record<string, Person>, personId);

  return person;
}
