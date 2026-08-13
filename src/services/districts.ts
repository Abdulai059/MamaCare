import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { districts$ } from "@/state/districts";
import type { District } from "@/utils/types/person";

const STORAGE_KEY = "districts_local";

export async function loadDistrictsFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      districts$.set(JSON.parse(stored));
    }
  } catch (error) {
    console.error("[Districts] Storage load error:", error);
  }
}

export async function getDistricts() {
  try {
    const { data, error } = await supabase.from("districts").select("*");
    if (error) throw error;

    if (data) {
      const map: Record<string, District> = {};
      data.forEach((d) => {
        map[d.id] = d;
      });
      districts$.set(map);
    }
  } catch (error) {
    console.error("[Districts] Fetch error:", error);
  }
}
