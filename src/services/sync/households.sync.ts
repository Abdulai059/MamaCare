import {
  isSyncing$,
  setHouseholdsSyncing,
  setHouseholdsLastSync,
  households$,
} from "@/state/households";
import { offlineSyncManager } from "@/services/offlineSync";
import {
  upsertHouseholdToSupabase,
  deleteHouseholdFromSupabase,
} from "@/repositories/households.repository";
import type { Household } from "@/utils/types/household";

const RETRY_KEY = "households-retry";
const RETRY_DELAY_MS = 5000;

async function syncSingleHousehold(
  id: string,
  household: Household,
): Promise<boolean> {
  const isDelete = Boolean(household.deleted_at) && !household._syncedDelete;
  const isUpsert = !household.deleted_at && !household._synced;

  if (!isDelete && !isUpsert) return true;

  households$[id]._syncState.set("syncing");

  try {
    if (isDelete) {
      if (!household.deleted_at) {
        throw new Error("Cannot delete household without deleted_at timestamp");
      }
      await deleteHouseholdFromSupabase(id, household.deleted_at);
      households$[id]._syncedDelete.set(true);
    } else {
      await upsertHouseholdToSupabase(household);
      households$[id]._synced.set(true);
    }
    households$[id]._syncState.set("synced");
    return true;
  } catch (error) {
    console.error("[Households Sync] Failed to sync household:", id, error);
    households$[id]._syncState.set("failed");
    return false;
  }
}

export async function syncHouseholdsToSupabase() {
  const isSyncing = isSyncing$.get();
  if (isSyncing) return;

  setHouseholdsSyncing(true);

  try {
    const allHouseholds = Object.entries(households$.get() ?? {});
    let syncedCount = 0;
    let failedCount = 0;

    for (const [id, household] of allHouseholds) {
      const success = await syncSingleHousehold(id, household);
      if (success) syncedCount++;
      else failedCount++;
    }

    setHouseholdsLastSync(new Date().toISOString());
    console.log(
      `[Households Sync] Sync complete: ${syncedCount} synced, ${failedCount} failed`,
    );

    if (failedCount > 0) {
      offlineSyncManager.scheduleRetry(
        RETRY_KEY,
        syncHouseholdsToSupabase,
        RETRY_DELAY_MS,
      );
    } else {
      offlineSyncManager.cancelRetry(RETRY_KEY);
    }
  } catch (error) {
    console.error("[Households Sync] Error during sync:", error);
  } finally {
    setHouseholdsSyncing(false);
  }
}
