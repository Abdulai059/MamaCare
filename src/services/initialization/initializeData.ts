import { offlineSyncManager } from "@/services/offlineSync";
import { assignedCommunityIds$ } from "@/state/auth";

// State imports
import { persons$, setPersonsSyncing, setPersonsLastSync } from "@/state/persons";
import { households$, setHouseholdsSyncing, setHouseholdsLastSync } from "@/state/households";
import { communities$ } from "@/state/communities";
import { districts$ } from "@/state/districts";
import { regions$ } from "@/state/regions";
import {
  careEpisodes$,
  isCareEpisodesSyncing$,
  setCareEpisodesSyncing,
  setCareEpisodesLastSync,
} from "@/state/careEpisodes";

// Repository imports
import {
  loadPersons,
  savePersons,
  fetchPersons,
} from "@/repositories/persons.repository";
import {
  loadHouseholds,
  saveHouseholds,
  fetchHouseholds,
} from "@/repositories/households.repository";
import {
  loadCareEpisodes,
  saveCareEpisodes,
  fetchCareEpisodes,
} from "@/repositories/careEpisodes.repository";
import {
  loadCommunities,
  saveCommunities,
} from "@/repositories/communities.repository";
import { loadDistricts, saveDistricts } from "@/repositories/districts.repository";
import { loadRegions, saveRegions } from "@/repositories/regions.repository";

// Sync service imports
import { syncPersonsToSupabase } from "@/services/sync/persons.sync";
import { syncHouseholdsToSupabase } from "@/services/sync/households.sync";
import { syncCareEpisodesToSupabase } from "@/services/sync/careEpisodes.sync";
import { syncCommunitiesFromSupabase } from "@/services/sync/communities.sync";
import { syncDistrictsFromSupabase } from "@/services/sync/districts.sync";
import { syncRegionsFromSupabase } from "@/services/sync/regions.sync";

// =========================================================
// STORAGE PERSISTENCE SETUP
// =========================================================

// Setup persistence for persons
persons$.onChange(async () => {
  try {
    const data = persons$.get();
    await savePersons(data);
  } catch (error) {
    console.error("[Persons State] Error saving to storage:", error);
  }
});

// Setup persistence for households
households$.onChange(async () => {
  try {
    const data = households$.get();
    await saveHouseholds(data);
  } catch (error) {
    console.error("[Households State] Error saving to storage:", error);
  }
});

// Setup persistence for care episodes
careEpisodes$.onChange(async () => {
  try {
    const data = careEpisodes$.get();
    await saveCareEpisodes(data);
  } catch (error) {
    console.error("[CareEpisodes State] Error saving to storage:", error);
  }
});

// Setup persistence for communities
communities$.onChange(async () => {
  try {
    const data = communities$.get();
    await saveCommunities(data);
  } catch (error) {
    console.error("[Communities State] Error saving to storage:", error);
  }
});

// Setup persistence for districts
districts$.onChange(async () => {
  try {
    const data = districts$.get();
    await saveDistricts(data);
  } catch (error) {
    console.error("[Districts State] Error saving to storage:", error);
  }
});

// Setup persistence for regions
regions$.onChange(async () => {
  try {
    const data = regions$.get();
    await saveRegions(data);
  } catch (error) {
    console.error("[Regions State] Error saving to storage:", error);
  }
});

// =========================================================
// REMOTE DATA FETCHING (WITH DEPENDENCY ORDER)
// =========================================================

async function fetchRegionsData() {
  try {
    await syncRegionsFromSupabase();
  } catch (error) {
    console.error("[Init] Error fetching regions:", error);
  }
}

async function fetchDistrictsData() {
  try {
    await syncDistrictsFromSupabase();
  } catch (error) {
    console.error("[Init] Error fetching districts:", error);
  }
}

async function fetchCommunitiesData() {
  try {
    await syncCommunitiesFromSupabase();
  } catch (error) {
    console.error("[Init] Error fetching communities:", error);
  }
}

async function fetchHouseholdsData() {
  try {
    const communityIds = assignedCommunityIds$.get();
    if (!communityIds || communityIds.length === 0) {
      console.log("[Init] No assigned communities, skipping households fetch");
      return;
    }

    const data = await fetchHouseholds(communityIds);
    const currentLocal = households$.get() ?? {};
    const updatedMap: Record<string, any> = { ...currentLocal };

    data.forEach((remoteHousehold) => {
      const local = currentLocal[remoteHousehold.id];

      // Safe merge: Don't overwrite if local record has unsynced changes
      if (!local || local._syncState === "synced") {
        updatedMap[remoteHousehold.id] = {
          ...remoteHousehold,
          _synced: true,
          _syncedDelete: !!remoteHousehold.deleted_at,
          _syncState: "synced",
        };
      }
    });

    households$.set(updatedMap);
    setHouseholdsLastSync(new Date().toISOString());
    console.log(`[Init] Fetched ${data.length} households`);
  } catch (error) {
    console.error("[Init] Error fetching households:", error);
  }
}

async function fetchPersonsData() {
  try {
    const householdIds = Object.keys(households$.get() ?? {});
    if (householdIds.length === 0) {
      console.log("[Init] No households, skipping persons fetch");
      return;
    }

    const data = await fetchPersons(householdIds);
    const currentLocal = persons$.get() ?? {};
    const updatedMap: Record<string, any> = { ...currentLocal };

    data.forEach((remotePerson) => {
      const local = currentLocal[remotePerson.id];

      // Safe merge: Don't overwrite if local record has unsynced changes
      if (!local || local._syncState === "synced") {
        updatedMap[remotePerson.id] = {
          ...remotePerson,
          _synced: true,
          _syncedDelete: !!remotePerson.deleted_at,
          _syncState: "synced",
        };
      }
    });

    persons$.set(updatedMap);
    setPersonsLastSync(new Date().toISOString());
    console.log(`[Init] Fetched ${data.length} persons`);
  } catch (error) {
    console.error("[Init] Error fetching persons:", error);
  }
}

async function fetchCareEpisodesData() {
  try {
    const personIds = Object.keys(persons$.get() ?? {});
    if (personIds.length === 0) {
      console.log("[Init] No persons, skipping care episodes fetch");
      return;
    }

    const data = await fetchCareEpisodes(personIds);
    const currentLocal = careEpisodes$.get() ?? {};
    const updatedMap: Record<string, any> = { ...currentLocal };

    data.forEach((remote) => {
      const local = currentLocal[remote.id];

      if (!local || local._syncState === "synced") {
        updatedMap[remote.id] = {
          ...remote,
          _synced: true,
          _syncedDelete: !!remote.deleted_at,
          _syncState: "synced",
        };
      }
    });

    careEpisodes$.set(updatedMap);
    setCareEpisodesLastSync(new Date().toISOString());
    console.log(`[Init] Fetched ${data.length} care episodes`);
  } catch (error) {
    console.error("[Init] Error fetching care episodes:", error);
  }
}

// =========================================================
// MAIN INITIALIZATION FUNCTION
// =========================================================

export async function initializeData() {
  console.log("[Init] Starting data initialization...");

  // Phase 1: Load all local data from AsyncStorage (parallel)
  console.log("[Init] Phase 1: Loading local data...");
  await Promise.all([
    loadRegions(),
    loadDistricts(),
    loadCommunities(),
    loadHouseholds(),
    loadPersons(),
    loadCareEpisodes(),
  ]);

  // Phase 2: Fetch remote data in dependency order
  console.log("[Init] Phase 2: Fetching remote data in dependency order...");
  
  // Level 1: Independent location data
  await fetchRegionsData();
  
  // Level 2: Districts depend on Regions
  await fetchDistrictsData();
  
  // Level 3: Communities depend on Districts
  await fetchCommunitiesData();
  
  // Level 4: Households depend on Communities
  await fetchHouseholdsData();
  
  // Level 5: Persons depend on Households
  await fetchPersonsData();
  
  // Level 6: Care Episodes depend on Persons
  await fetchCareEpisodesData();

  // Phase 3: Register offline sync listeners
  console.log("[Init] Phase 3: Registering offline sync listeners...");
  offlineSyncManager.register("households", {
    onForeground: async () => {
      await syncHouseholdsToSupabase();
      await fetchHouseholdsData();
    },
  });

  offlineSyncManager.register("persons", {
    onForeground: async () => {
      await syncPersonsToSupabase();
      await fetchPersonsData();
    },
  });

  offlineSyncManager.register("care-episodes", {
    onForeground: async () => {
      await syncCareEpisodesToSupabase();
      await fetchCareEpisodesData();
    },
  });

  // Phase 4: Trigger initial push sync (with delay)
  console.log("[Init] Phase 4: Scheduling initial sync...");
  setTimeout(() => {
    console.log("[Init] Starting initial sync push...");
    syncHouseholdsToSupabase();
    // Persons and care episodes will sync after households due to FK constraints
  }, 2000);

  console.log("[Init] Data initialization complete");
}
