import { use$ } from "@legendapp/state/react";
import { households$, isSyncing$, lastSyncTime$ } from "@/state/households";
import { selectActiveHouseholds } from "@/selectors/households/household.selectors";
import type { Household } from "@/utils/types/household";

export function useHouseholds() {
  const households = use$(households$) || {};
  const isSyncing = use$(isSyncing$) || false;
  const lastSyncTime = use$(lastSyncTime$) || null;

  const householdsList = selectActiveHouseholds(
    households as Record<string, Household>,
  ).sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  return {
    households: households as Record<string, Household>,
    householdsList,
    isSyncing,
    lastSyncTime,
  };
}
