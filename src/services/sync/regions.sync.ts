import { regions$ } from "@/state/regions";
import { fetchRegions } from "@/repositories/regions.repository";
import type { Region } from "@/utils/types/person";

export async function syncRegionsFromSupabase() {
  try {
    const data = await fetchRegions();
    const map: Record<string, Region> = {};
    data.forEach((r) => {
      map[r.id] = r;
    });
    regions$.set(map);
    console.log(`[Regions Sync] Fetched ${data.length} regions`);
  } catch (error) {
    console.error("[Regions Sync] Error during sync:", error);
  }
}
