import { observable } from "@legendapp/state";
import { assignedCommunityIds$ } from "@/state/auth";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

// Simple in-memory observable that syncs to AsyncStorage and Supabase
export const households$ = observable<Record<string, any>>({});
export const isSyncing$ = observable(false);
export const lastSyncTime$ = observable<string | null>(null);

let syncTimeout: NodeJS.Timeout | null = null;
let appState = AppState.currentState;

// Monitor when app comes to foreground (proxy for network restoration)
function setupAppStateListener() {
  const subscription = AppState.addEventListener("change", handleAppStateChange);

  function handleAppStateChange(nextAppState: AppStateStatus) {
    console.log("[Households] App state:", appState, "→", nextAppState);

    // When app comes to foreground, try to sync
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      console.log("[Households] App in foreground, attempting sync...");
      // Small delay to ensure network is ready
      setTimeout(() => syncHouseholdsToSupabase(), 500);
    }

    appState = nextAppState;
  }

  return subscription;
}

// Load from AsyncStorage on init
export async function loadHouseholdsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem("households_local");
    if (stored) {
      const data = JSON.parse(stored);
      households$.set(data);
      console.log("[Households] Loaded from storage:", Object.keys(data).length, "items");
    }
  } catch (error) {
    console.error("[Households] Error loading from storage:", error);
  }
}

// Save to AsyncStorage whenever households change
households$.onChange(async () => {
  try {
    const data = households$.get();
    await AsyncStorage.setItem("households_local", JSON.stringify(data));
    console.log("[Households] Saved to AsyncStorage");
  } catch (error) {
    console.error("[Households] Error saving to storage:", error);
  }
});

// Sync to Supabase with retry logic
export async function syncHouseholdsToSupabase() {
  if (isSyncing$.get()) {
    console.log("[Households] Sync already in progress, skipping");
    return;
  }

  isSyncing$.set(true);
  console.log("[Households] Starting sync to Supabase...");

  try {
    const communityIds = assignedCommunityIds$.get();
    if (!communityIds || communityIds.length === 0) {
      console.log("[Households] No community IDs, skipping sync");
      return;
    }

    const allHouseholds = Object.entries(households$.get() || {});
    let syncedCount = 0;
    let failedCount = 0;

    for (const [id, household] of allHouseholds) {
      const h = household as any;

      try {
        if (h.deleted_at && !h._syncedDelete) {
          // Soft delete in Supabase
          console.log("[Households] Syncing delete:", id);
          const { error } = await supabase
            .from("households")
            .update({ deleted_at: h.deleted_at })
            .eq("id", id);

          if (!error) {
            households$[id]._syncedDelete.set(true);
            syncedCount++;
            console.log("[Households] ✅ Synced delete:", id);
          } else {
            failedCount++;
            console.error("[Households] ❌ Failed to sync delete:", id, error);
          }
        } else if (!h.deleted_at && !h._synced) {
          // Insert or update
          console.log("[Households] Syncing:", id);
          const { error } = await supabase.from("households").upsert({
            id: h.id,
            household_code: h.household_code,
            community_id: h.community_id,
            address_description: h.address_description,
            latitude: h.latitude,
            longitude: h.longitude,
            created_at: h.created_at,
            updated_at: h.updated_at,
          });

          if (!error) {
            households$[id]._synced.set(true);
            syncedCount++;
            console.log("[Households] ✅ Synced:", id);
          } else {
            failedCount++;
            console.error("[Households] ❌ Failed to sync:", id, error);
          }
        }
      } catch (error) {
        failedCount++;
        console.error("[Households] ❌ Error syncing household", id, error);
      }
    }

    lastSyncTime$.set(new Date().toISOString());
    console.log(
      `[Households] Sync complete: ${syncedCount} synced, ${failedCount} failed`,
    );

    // If there were failures, retry in 5 seconds
    if (failedCount > 0) {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        console.log("[Households] Retrying failed syncs...");
        syncHouseholdsToSupabase();
      }, 5000);
    }
  } catch (error) {
    console.error("[Households] Error during sync:", error);
  } finally {
    isSyncing$.set(false);
  }
}

// Sync on app startup
export async function initializeHouseholds() {
  console.log("[Households] Initializing...");

  // Setup app state listener FIRST
  setupAppStateListener();

  // Load from storage
  await loadHouseholdsFromStorage();

  // Sync after 2 seconds (give auth time to initialize)
  setTimeout(() => syncHouseholdsToSupabase(), 2000);
}

export async function createHousehold(data: {
  household_code: string;
  address_description?: string;
  latitude?: number;
  longitude?: number;
}) {
  const communityIds = assignedCommunityIds$.get();
  if (!communityIds || communityIds.length === 0) {
    throw new Error("No assigned community");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const household = {
    id,
    household_code: data.household_code,
    community_id: communityIds[0],
    address_description: data.address_description || null,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _synced: false,
    _syncedDelete: false,
  };

  households$[id].set(household);
  console.log("[Households] Created:", id);

  // Sync immediately
  syncHouseholdsToSupabase();

  return id;
}

export async function updateHousehold(
  id: string,
  data: Partial<{
    household_code: string;
    address_description: string;
    latitude: number;
    longitude: number;
  }>,
) {
  const now = new Date().toISOString();
  const current = households$[id].get();

  if (!current) {
    throw new Error("Household not found");
  }

  households$[id].set({
    ...current,
    ...data,
    updated_at: now,
    _synced: false,
  });

  console.log("[Households] Updated:", id);

  syncHouseholdsToSupabase();
}

export async function deleteHousehold(id: string) {
  const now = new Date().toISOString();
  const current = households$[id].get();

  if (!current) {
    throw new Error("Household not found");
  }

  households$[id].set({
    ...current,
    deleted_at: now,
    _synced: false,
    _syncedDelete: false,
  });

  console.log("[Households] Deleted:", id);

  syncHouseholdsToSupabase();
}
