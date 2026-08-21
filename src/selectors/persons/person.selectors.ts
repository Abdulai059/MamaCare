import type { Person } from "@/utils/types/person";

export function selectPersonsByHousehold(
  persons: Record<string, Person>,
  householdId: string,
): Person[] {
  return Object.values(persons).filter(
    (person) => person.household_id === householdId && !person.deleted_at,
  );
}

export function selectActivePersons(persons: Record<string, Person>): Person[] {
  return Object.values(persons).filter((person) => !person.deleted_at);
}

export function selectPersonsByRole(
  persons: Record<string, Person>,
  role: "MOTHER" | "CHILD" | "CAREGIVER",
): Person[] {
  return Object.values(persons).filter(
    (person) => person.role === role && !person.deleted_at,
  );
}

export function selectPersonById(
  persons: Record<string, Person>,
  personId: string,
): Person | null {
  const person = persons[personId];
  return person && !person.deleted_at ? person : null;
}

export function selectPendingPersons(
  persons: Record<string, Person>,
): Person[] {
  return Object.values(persons).filter(
    (person) =>
      !person.deleted_at &&
      (!person._synced || person._syncState === "pending"),
  );
}

export function selectMothers(persons: Record<string, Person>): Person[] {
  return selectPersonsByRole(persons, "MOTHER");
}

export function selectChildren(persons: Record<string, Person>): Person[] {
  return selectPersonsByRole(persons, "CHILD");
}

export function selectCaregivers(persons: Record<string, Person>): Person[] {
  return selectPersonsByRole(persons, "CAREGIVER");
}
