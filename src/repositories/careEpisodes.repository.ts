import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { CareEpisode } from "@/utils/types/careEpisode";

const STORAGE_KEY = "care_episodes_local";

export async function loadCareEpisodes(): Promise<Record<string, CareEpisode>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[CareEpisodes Repository] Storage load error:", error);
    return {};
  }
}

export async function saveCareEpisodes(
  careEpisodes: Record<string, CareEpisode>,
) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(careEpisodes));
  } catch (error) {
    console.error("[CareEpisodes Repository] Storage save error:", error);
  }
}

export async function fetchCareEpisodes(
  personIds: string[],
): Promise<CareEpisode[]> {
  if (personIds.length === 0) return [];

  const { data, error } = await supabase
    .from("care_episodes")
    .select("*")
    .in("person_id", personIds);

  if (error) {
    console.error("[CareEpisodes Repository] Supabase fetch error:", error);
    throw error;
  }

  return data ?? [];
}

export async function upsertCareEpisodeToSupabase(
  episode: CareEpisode,
): Promise<void> {
  const { error } = await supabase.from("care_episodes").upsert({
    id: episode.id,
    person_id: episode.person_id,
    episode_type: episode.episode_type,
    status: episode.status,
    start_date: episode.start_date,
    expected_end_date: episode.expected_end_date,
    actual_end_date: episode.actual_end_date,
    parent_episode_id: episode.parent_episode_id,
    created_by: episode.created_by,
    created_at: episode.created_at,
    updated_at: episode.updated_at,
  });

  if (error) {
    throw error;
  }
}

export async function deleteCareEpisodeFromSupabase(
  id: string,
  deletedAt: string,
): Promise<void> {
  const { error } = await supabase
    .from("care_episodes")
    .update({ deleted_at: deletedAt })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
