import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { Region } from "@/utils/types/person";

const STORAGE_KEY = "regions_local";

export async function loadRegions(): Promise<Record<string, Region>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[Regions Repository] Storage load error:", error);
    return {};
  }
}

export async function saveRegions(regions: Record<string, Region>) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
  } catch (error) {
    console.error("[Regions Repository] Storage save error:", error);
  }
}

export async function fetchRegions(): Promise<Region[]> {
  const { data, error } = await supabase.from("regions").select("*");

  if (error) {
    console.error("[Regions Repository] Supabase fetch error:", error);
    throw error;
  }

  return data ?? [];
}
