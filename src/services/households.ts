import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import {
  households$,
  isSyncing$,
  setHouseholdsSyncing,
  setHouseholdsLastSync,
} from "@/state/households";
import { assignedCommunityIds$ } from "@/state/auth";
import { offlineSyncManager } from "@/services/offlineSync";
import type { Household } from "@/utils/types/household";

type UpdateHouseholdInput = Partial<
  Pick<
    Household,
    "household_code" | "address_description" | "latitude" | "longitude"
  >
>;

const STORAGE_KEY = "households_local";
const RETRY_KEY = "households-retry";
const RETRY_DELAY_MS = 5000;

export async function loadHouseholdsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: Record<string, Household> = JSON.parse(stored);
      households$.set(data);
    }
  } catch (error) {
    console.error("[Households] Error loading from storage:", error);
  }
}

/** Syncs a single household's delete to Supabase. Returns whether it succeeded. */
async function syncDelete(id: string, household: Household): Promise<boolean> {
  households$[id]._syncState.set("syncing");

  const { error } = await supabase
    .from("households")
    .update({ deleted_at: household.deleted_at })
    .eq("id", id);

  if (error) {
    console.error("[Households] Failed to sync delete:", id, error);
    households$[id]._syncState.set("failed");
    return false;
  }

  households$[id]._syncedDelete.set(true);
  households$[id]._syncState.set("synced");
  return true;
}

/** Syncs a single household's create/update to Supabase. Returns whether it succeeded. */
async function syncUpsert(id: string, household: Household): Promise<boolean> {
  households$[id]._syncState.set("syncing");

  const { error } = await supabase.from("households").upsert({
    id: household.id,
    household_code: household.household_code,
    community_id: household.community_id,
    address_description: household.address_description,
    latitude: household.latitude,
    longitude: household.longitude,
    created_at: household.created_at,
    updated_at: household.updated_at,
  });

  if (error) {
    console.error("[Households] Failed to sync:", id, error);
    households$[id]._syncState.set("failed");
    return false;
  }

  households$[id]._synced.set(true);
  households$[id]._syncState.set("synced");
  return true;
}

export async function syncHouseholdsToSupabase() {
  if (isSyncing$.get()) return;

  setHouseholdsSyncing(true);

  try {
    const communityIds = assignedCommunityIds$.get();
    if (!communityIds || communityIds.length === 0) {
      return;
    }

    const allHouseholds = Object.entries(households$.get() ?? {});
    let syncedCount = 0;
    let failedCount = 0;

    for (const [id, household] of allHouseholds) {
      try {
        let success: boolean | null = null;

        if (household.deleted_at && !household._syncedDelete) {
          success = await syncDelete(id, household);
        } else if (!household.deleted_at && !household._synced) {
          success = await syncUpsert(id, household);
        }

        if (success === true) syncedCount++;
        if (success === false) failedCount++;
      } catch (error) {
        console.error("[Households] Error syncing household:", id, error);
        households$[id]._syncState.set("failed");
        failedCount++;
      }
    }

    setHouseholdsLastSync(new Date().toISOString());
    console.log(
      `[Households] Sync complete: ${syncedCount} synced, ${failedCount} failed`,
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
    console.error("[Households] Error during sync:", error);
  } finally {
    setHouseholdsSyncing(false);
  }
}

/** Fires a background sync and swallows/logs any error so callers don't need to. */
function syncInBackground() {
  syncHouseholdsToSupabase().catch((error) => {
    console.error("[Households] Background sync error:", error);
  });
}

export async function createHousehold(data: {
  household_code: string;
  address_description?: string;
  latitude?: number;
  longitude?: number;
}): Promise<string> {
  const communityIds = assignedCommunityIds$.get();
  if (!communityIds || communityIds.length === 0) {
    throw new Error("No assigned community");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const household: Household = {
    id,
    household_code: data.household_code,
    community_id: communityIds[0],
    address_description: data.address_description ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  };

  households$[id].set(household);
  syncInBackground();

  return id;
}

export async function updateHousehold(
  id: string,
  data: UpdateHouseholdInput,
): Promise<void> {
  const current = households$[id].get();
  if (!current) {
    throw new Error("Household not found");
  }

  households$[id].set({
    ...current,
    ...data,
    updated_at: new Date().toISOString(),
    _synced: false,
    _syncState: "pending",
  });

  syncInBackground();
}

export async function deleteHousehold(id: string) {
  const current = households$[id].get();
  if (!current) {
    throw new Error("Household not found");
  }

  households$[id].set({
    ...current,
    deleted_at: new Date().toISOString(),
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  });

  syncInBackground();
}

export async function initializeHouseholds() {
  await loadHouseholdsFromStorage();

  offlineSyncManager.register("households", {
    onForeground: syncHouseholdsToSupabase,
  });

  setTimeout(() => syncHouseholdsToSupabase(), 2000);
}
