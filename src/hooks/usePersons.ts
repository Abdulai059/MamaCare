import { useMemo } from "react";
import { persons$, isSyncing$, lastSyncTime$, getPersonsByHousehold } from "@/state/persons";
import {
  createPerson,
  updatePerson,
  deletePerson,
  syncPersonsToSupabase,
} from "@/services/persons";

/**
 * Hook to access persons state and operations
 * Component must be wrapped with observer() to get reactive updates
 */
export function usePersons() {
  // Get current values from observables
  const persons = persons$.get() || {};
  const isSyncing = isSyncing$.get() || false;
  const lastSyncTime = lastSyncTime$.get() || null;

  // Convert observable record to array and filter out deleted items
  const personsList = useMemo(() => {
    return Object.values(persons as Record<string, any>)
      .filter((p: any) => !p.deleted_at)
      .sort((a: any, b: any) => (a.created_at || "").localeCompare(b.created_at || ""));
  }, [persons]);

  return {
    persons: persons as Record<string, any>,
    personsList,
    isSyncing: isSyncing as boolean,
    lastSyncTime: lastSyncTime as string | null,
    createPerson,
    updatePerson,
    deletePerson,
    getPersonsByHousehold,
    syncNow: syncPersonsToSupabase,
  };
}
