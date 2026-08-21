import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { Household } from "@/utils/types/household";

const STORAGE_KEY = "households_local";

export async function loadHouseholds(): Promise<Record<string, Household>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[Households Repository] Storage load error:", error);
    return {};
  }
}

export async function saveHouseholds(households: Record<string, Household>) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(households));
  } catch (error) {
    console.error("[Households Repository] Storage save error:", error);
  }
}

export async function fetchHouseholds(
  communityIds: string[],
): Promise<Household[]> {
  if (communityIds.length === 0) return [];

  const { data, error } = await supabase
    .from("households")
    .select("*")
    .in("community_id", communityIds);

  if (error) {
    console.error("[Households Repository] Supabase fetch error:", error);
    throw error;
  }

  return data ?? [];
}

export async function upsertHouseholdToSupabase(
  household: Household,
): Promise<void> {
  const { error } = await supabase.from("households").upsert({
    id: household.id,
    household_code: household.household_code,
    community_id: household.community_id,
    address_description: household.address_description,
    latitude: household.latitude,
    longitude: household.longitude,
    created_at: household.created_at,
    updated_at: household.updated_at,
  });

  if (error) {
    throw error;
  }
}

export async function deleteHouseholdFromSupabase(
  id: string,
  deletedAt: string,
): Promise<void> {
  const { error } = await supabase
    .from("households")
    .update({ deleted_at: deletedAt })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
