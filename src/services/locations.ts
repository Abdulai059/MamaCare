import { loadRegions } from "@/repositories/regions.repository";
import { loadDistricts } from "@/repositories/districts.repository";
import { loadCommunities } from "@/repositories/communities.repository";
import { syncRegionsFromSupabase } from "@/services/sync/regions.sync";
import { syncDistrictsFromSupabase } from "@/services/sync/districts.sync";
import { syncCommunitiesFromSupabase } from "@/services/sync/communities.sync";

export async function initializeLocations() {
  // 1. Fast local cache load (Parallel)
  await Promise.all([loadRegions(), loadDistricts(), loadCommunities()]);

  // 2. Background sync down from Supabase (Parallel)
  Promise.all([
    syncRegionsFromSupabase(),
    syncDistrictsFromSupabase(),
    syncCommunitiesFromSupabase(),
  ]).catch((err) => console.error("[Locations] Sync error:", err));
}
