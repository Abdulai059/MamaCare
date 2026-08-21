import { districts$ } from "@/state/districts";
import { fetchDistricts } from "@/repositories/districts.repository";
import type { District } from "@/utils/types/person";

export async function syncDistrictsFromSupabase() {
  try {
    const data = await fetchDistricts();
    const map: Record<string, District> = {};
    data.forEach((d) => {
      map[d.id] = d;
    });
    districts$.set(map);
    console.log(`[Districts Sync] Fetched ${data.length} districts`);
  } catch (error) {
    console.error("[Districts Sync] Error during sync:", error);
  }
}
