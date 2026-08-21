import { initializeAuth } from "@/state/auth";
import { offlineSyncManager } from "@/services/offlineSync";
import { initializeData } from "@/services/initialization/initializeData";

/**
 * Orchestrated initialization sequence
 * Ensures proper order of initialization to avoid race conditions:
 * 1. Start offline sync manager
 * 2. Initialize auth state and profile loading
 * 3. Initialize all data with centralized initialization service
 */
export async function initializeApp() {
  console.log("[App Init] Starting initialization sequence...");

  // Step 1: Setup the offline sync manager
  console.log("[App Init] Setting up offline sync manager...");
  offlineSyncManager.setupAppStateListener();

  // Step 2: Initialize auth (loads profile and sets up auth state)
  console.log("[App Init] Initializing auth...");
  await initializeAuth();

  // Step 3: Initialize all data with centralized service
  console.log("[App Init] Initializing data...");
  await initializeData();

  console.log("[App Init] Initialization complete!");
}
