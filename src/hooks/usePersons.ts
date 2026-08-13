import { useMemo } from "react";
import { use$ } from "@legendapp/state/react";
import {
  persons$,
  isSyncing$,
  lastSyncTime$,
  getPersonsByHousehold,
} from "@/state/persons";
import {
  createPerson,
  updatePerson,
  deletePerson,
  syncPersonsToSupabase,
  getPersons,
} from "@/services/persons";
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
  const personsList = useMemo(() => {
    return Object.values(persons as Record<string, Person>)
      .filter((p) => !p.deleted_at)
      .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
  }, [persons]);

  return {
    persons: persons as Record<string, Person>,
    personsList,
    isSyncing,
    lastSyncTime,
    // Operations
    createPerson,
    updatePerson,
    deletePerson,
    getPersonsByHousehold,
    syncNow: syncPersonsToSupabase,
    refreshPersons: getPersons,
  };
}
