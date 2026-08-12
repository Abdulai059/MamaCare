import { initializeAuth } from "@/state/auth";
import { initializeHouseholds } from "@/services/households";
import { initializePersons } from "@/services/persons";
import { offlineSyncManager } from "@/services/offlineSync";

/**
 * Orchestrated initialization sequence
 * Ensures proper order of initialization to avoid race conditions:
 * 1. Start offline sync manager
 * 2. Initialize auth state and profile loading
 * 3. Once auth is ready, initialize households
 * 4. Once households are ready, initialize persons
 */
export async function initializeApp() {
  console.log("[App Init] Starting initialization sequence...");

  // Step 1: Setup the offline sync manager
  console.log("[App Init] Setting up offline sync manager...");
  offlineSyncManager.setupAppStateListener();

  // Step 2: Initialize auth (loads profile and sets up auth state)
  console.log("[App Init] Initializing auth...");
  await initializeAuth();

  // Step 3: Initialize households (loads from storage and syncs)
  console.log("[App Init] Initializing households...");
  await initializeHouseholds();

  // Step 4: Initialize persons (loads from storage and syncs)
  console.log("[App Init] Initializing persons...");
  await initializePersons();

  console.log("[App Init] Initialization complete!");
}
