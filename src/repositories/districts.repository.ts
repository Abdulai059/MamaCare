import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { District } from "@/utils/types/person";

const STORAGE_KEY = "districts_local";

export async function loadDistricts(): Promise<Record<string, District>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[Districts Repository] Storage load error:", error);
    return {};
  }
}

export async function saveDistricts(districts: Record<string, District>) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(districts));
  } catch (error) {
    console.error("[Districts Repository] Storage save error:", error);
  }
}

export async function fetchDistricts(): Promise<District[]> {
  const { data, error } = await supabase.from("districts").select("*");

  if (error) {
    console.error("[Districts Repository] Supabase fetch error:", error);
    throw error;
  }

  return data ?? [];
}
