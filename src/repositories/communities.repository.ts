import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { Community } from "@/utils/types/person";

const STORAGE_KEY = "communities_local";

export async function loadCommunities(): Promise<Record<string, Community>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[Communities Repository] Storage load error:", error);
    return {};
  }
}

export async function saveCommunities(
  communities: Record<string, Community>,
) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(communities));
  } catch (error) {
    console.error("[Communities Repository] Storage save error:", error);
  }
}

export async function fetchCommunities(): Promise<Community[]> {
  const { data, error } = await supabase.from("communities").select("*");

  if (error) {
    console.error("[Communities Repository] Supabase fetch error:", error);
    throw error;
  }

  return data ?? [];
}
