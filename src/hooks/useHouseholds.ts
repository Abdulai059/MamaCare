import { households$, isSyncing$, lastSyncTime$ } from "@/state/households";
import type { Household } from "@/utils/types/household";
import {
  createHousehold,
  updateHousehold,
  deleteHousehold,
  syncHouseholdsToSupabase,
  getHouseholds,
} from "@/services/households";

/**
 * Hook to access households state and operations.
 * Component must be wrapped with observer() to get reactive updates.
 */
export function useHouseholds() {
  const households = households$.get() ?? {};
  const isSyncing = isSyncing$.get();
  const lastSyncTime = lastSyncTime$.get();

  // Active (non-deleted) households, oldest first
  // Note: No useMemo needed - LegendApp's observer handles reactivity
  const householdsList = Object.values(households)
    .filter((h) => !h.deleted_at)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  return {
    households,
    householdsList,
    isSyncing,
    lastSyncTime,
    createHousehold,
    updateHousehold,
    deleteHousehold,
    syncNow: syncHouseholdsToSupabase,
    refreshHouseholds: getHouseholds,
  };
}
