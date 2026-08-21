import { v4 as uuidv4 } from "uuid";
import { batch } from "@legendapp/state";
import { careEpisodes$ } from "@/state/careEpisodes";
import { syncCareEpisodesToSupabase } from "@/services/sync/careEpisodes.sync";
import type { CareEpisode, EpisodeType } from "@/utils/types/careEpisode";

function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function syncInBackground() {
  syncCareEpisodesToSupabase().catch((error) => {
    console.error("[CareEpisodes Operations] Background sync error:", error);
  });
}

export function createCareEpisode(data: {
  person_id: string;
  episode_type: EpisodeType;
  start_date: string;
  expected_end_date?: string;
}): string {
  const id = uuidv4();
  const now = new Date().toISOString();

  const startDate = isValidDateFormat(data.start_date)
    ? data.start_date
    : now.slice(0, 10);

  const expectedEndDate =
    data.expected_end_date && isValidDateFormat(data.expected_end_date)
      ? data.expected_end_date
      : null;

  const episode: CareEpisode = {
    id,
    person_id: data.person_id,
    episode_type: data.episode_type,
    status: "ACTIVE",
    start_date: startDate,
    expected_end_date: expectedEndDate,
    actual_end_date: null,
    parent_episode_id: null,
    notes: null,
    created_by: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  };

  batch(() => {
    careEpisodes$[id].set(episode);
  });

  syncInBackground();

  return id;
}

export async function updateCareEpisode(
  id: string,
  data: Partial<
    Pick<
      CareEpisode,
      | "status"
      | "start_date"
      | "expected_end_date"
      | "actual_end_date"
      | "notes"
    >
  >,
): Promise<void> {
  const current = careEpisodes$[id].get();
  if (!current) throw new Error("Care episode not found");

  batch(() => {
    careEpisodes$[id].set({
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
      _synced: false,
      _syncState: "pending",
    });
  });

  syncInBackground();
}

export async function deleteCareEpisode(id: string): Promise<void> {
  const current = careEpisodes$[id].get();
  if (!current) throw new Error("Care episode not found");

  batch(() => {
    careEpisodes$[id].set({
      ...current,
      deleted_at: new Date().toISOString(),
      _synced: false,
      _syncedDelete: false,
      _syncState: "pending",
    });
  });

  syncInBackground();
}
