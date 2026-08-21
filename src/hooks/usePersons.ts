import { use$ } from "@legendapp/state/react";
import { persons$, isSyncing$, lastSyncTime$ } from "@/state/persons";
import {
  createPerson,
  updatePerson,
  deletePerson,
} from "@/services/persons.operations";
import { syncPersonsToSupabase } from "@/services/sync/persons.sync";
import { selectActivePersons } from "@/selectors/persons/person.selectors";
import type { Person } from "@/utils/types/person";

/**
 * Hook to access persons state and operations.
 * Components using values from this hook must be wrapped with observer()
 */
export function usePersons() {
  // Use LegendApp's use$ hook for reactive tracking inside React components
  const persons = use$(persons$) || {};
  const isSyncing = use$(isSyncing$) || false;
  const lastSyncTime = use$(lastSyncTime$) || null;

  // Convert dictionary into a sorted array of active persons
  // Note: No useMemo needed - LegendApp's observer handles reactivity
  const personsList = selectActivePersons(
    persons as Record<string, Person>,
  ).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  return {
    persons: persons as Record<string, Person>,
    personsList,
    isSyncing,
    lastSyncTime,
    // Operations
    createPerson,
    updatePerson,
    deletePerson,
    syncNow: syncPersonsToSupabase,
  };
}
