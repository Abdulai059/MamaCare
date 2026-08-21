import { use$ } from "@legendapp/state/react";
import { households$, isSyncing$, lastSyncTime$ } from "@/state/households";
import type { Household } from "@/utils/types/household";
import {
  createHousehold,
  updateHousehold,
  deleteHousehold,
} from "@/services/households.operations";
import { syncHouseholdsToSupabase } from "@/services/sync/households.sync";
import { selectActiveHouseholds } from "@/selectors/households/household.selectors";

/**
 * Hook to access households state and operations.
 * Component must be wrapped with observer() to get reactive updates.
 */
export function useHouseholds() {
  const households = use$(households$) || {};
  const isSyncing = use$(isSyncing$) || false;
  const lastSyncTime = use$(lastSyncTime$) || null;

  // Active (non-deleted) households, oldest first
  // Note: No useMemo needed - LegendApp's observer handles reactivity
  const householdsList = selectActiveHouseholds(
    households as Record<string, Household>,
  ).sort((a, b) => a.created_at.localeCompare(b.created_at));

  return {
    households: households as Record<string, Household>,
    householdsList,
    isSyncing,
    lastSyncTime,
    createHousehold,
    updateHousehold,
    deleteHousehold,
    syncNow: syncHouseholdsToSupabase,
  };
}
