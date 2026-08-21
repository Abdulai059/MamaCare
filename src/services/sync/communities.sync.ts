import { communities$ } from "@/state/communities";
import { fetchCommunities } from "@/repositories/communities.repository";
import type { Community } from "@/utils/types/person";

export async function syncCommunitiesFromSupabase() {
  try {
    const data = await fetchCommunities();
    const map: Record<string, Community> = {};
    data.forEach((c) => {
      map[c.id] = c;
    });
    communities$.set(map);
    console.log(`[Communities Sync] Fetched ${data.length} communities`);
  } catch (error) {
    console.error("[Communities Sync] Error during sync:", error);
  }
}
