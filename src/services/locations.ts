import { loadRegionsFromStorage, getRegions } from "./regions";
import { loadDistrictsFromStorage, getDistricts } from "./districts";
import { loadCommunitiesFromStorage, getCommunities } from "./communities";

export async function initializeLocations() {
  // 1. Fast local cache load (Parallel)
  await Promise.all([
    loadRegionsFromStorage(),
    loadDistrictsFromStorage(),
    loadCommunitiesFromStorage(),
  ]);

  // 2. Background sync down from Supabase (Parallel)
  Promise.all([getRegions(), getDistricts(), getCommunities()]).catch((err) =>
    console.error("[Locations] Sync error:", err),
  );
}
