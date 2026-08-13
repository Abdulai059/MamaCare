import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { communities$ } from "@/state/communities";
import type { Community } from "@/utils/types/person";

const STORAGE_KEY = "communities_local";

export async function loadCommunitiesFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      communities$.set(JSON.parse(stored));
    }
  } catch (error) {
    console.error("[Communities] Storage load error:", error);
  }
}

export async function getCommunities() {
  try {
    const { data, error } = await supabase.from("communities").select("*");
    if (error) throw error;

    if (data) {
      const map: Record<string, Community> = {};
      data.forEach((c) => {
        map[c.id] = c;
      });
      communities$.set(map);
    }
  } catch (error) {
    console.error("[Communities] Fetch error:", error);
  }
}
