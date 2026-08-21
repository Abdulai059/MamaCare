import { use$ } from "@legendapp/state/react";
import { persons$, isSyncing$, lastSyncTime$ } from "@/state/persons";
import { selectActivePersons } from "@/selectors/persons/person.selectors";
import type { Person } from "@/utils/types/person";

export function usePersons() {
  const persons = use$(persons$) || {};
  const isSyncing = use$(isSyncing$) || false;
  const lastSyncTime = use$(lastSyncTime$) || null;

  const personsList = selectActivePersons(persons as Record<string, Person>).sort(
    (a, b) => (a.created_at || "").localeCompare(b.created_at || ""),
  );

  return {
    persons: persons as Record<string, Person>,
    personsList,
    isSyncing,
    lastSyncTime,
  };
}
