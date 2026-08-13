import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { regions$ } from "@/state/regions";
import type { Region } from "@/utils/types/person";

const STORAGE_KEY = "regions_local";

export async function loadRegionsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      regions$.set(JSON.parse(stored));
    }
  } catch (error) {
    console.error("[Regions] Storage load error:", error);
  }
}

export async function getRegions() {
  try {
    const { data, error } = await supabase.from("regions").select("*");
    if (error) throw error;

    if (data) {
      const map: Record<string, Region> = {};
      data.forEach((r) => {
        map[r.id] = r;
      });
      regions$.set(map);
    }
  } catch (error) {
    console.error("[Regions] Fetch error:", error);
  }
}
