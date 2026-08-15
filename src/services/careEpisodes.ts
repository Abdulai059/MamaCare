import { v4 as uuidv4 } from "uuid";
import { batch } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import {
  careEpisodes$,
  isCareEpisodesSyncing$,
  setCareEpisodesSyncing,
  setCareEpisodesLastSync,
} from "@/state/careEpisodes";
import { persons$ } from "@/state/persons";
import { offlineSyncManager } from "@/services/offlineSync";
import type { CareEpisode, EpisodeType } from "@/utils/types/careEpisode";

const STORAGE_KEY = "care_episodes_local";
const FK_VIOLATION = "23503";
const INVALID_DATE_FORMAT = "22007";

type SyncOutcome = "synced" | "skipped" | "failed";

function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function syncInBackground() {
  syncCareEpisodesToSupabase().catch((error) => {
    console.error("[CareEpisodes] Background sync error:", error);
  });
}

// =========================================================
// BOOT & HYDRATION
// =========================================================

export async function loadCareEpisodesFromStorage() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const data: Record<string, CareEpisode> = JSON.parse(stored);
    careEpisodes$.set(data);
  } catch (error) {
    console.error("[CareEpisodes] Storage load error:", error);
  }
}

export async function getCareEpisodes() {
  try {
    const personIds = Object.keys(persons$.get() ?? {});
    if (personIds.length === 0) return;

    const { data, error } = await supabase
      .from("care_episodes")
      .select("*")
      .in("person_id", personIds);

    if (error) {
      console.error("[CareEpisodes] Error fetching from Supabase:", error);
      return;
    }

    if (data) {
      const currentLocal = careEpisodes$.get() ?? {};
      const updatedMap: Record<string, CareEpisode> = { ...currentLocal };

      data.forEach((remote) => {
        const local = currentLocal[remote.id];

        if (!local || local._syncState === "synced") {
          updatedMap[remote.id] = {
            ...remote,
            _synced: true,
            _syncedDelete: !!remote.deleted_at,
            _syncState: "synced",
          };
        }
      });

      careEpisodes$.set(updatedMap);
      setCareEpisodesLastSync(new Date().toISOString());
    }
  } catch (error) {
    console.error("[CareEpisodes] Fetch exception:", error);
  }
}

// =========================================================
// PUSH / SYNC
// =========================================================

async function syncSingleCareEpisode(
  id: string,
  episode: CareEpisode,
): Promise<SyncOutcome> {
  const isDelete = Boolean(episode.deleted_at) && !episode._syncedDelete;
  const isUpsert = !episode.deleted_at && !episode._synced;

  if (!isDelete && !isUpsert) return "synced";

  const action = isDelete ? "delete" : "upsert";
  careEpisodes$[id]._syncState?.set?.("syncing");

  const query = isDelete
    ? supabase
        .from("care_episodes")
        .update({ deleted_at: episode.deleted_at })
        .eq("id", id)
    : supabase.from("care_episodes").upsert({
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

  const { error } = await query;

  if (!error) {
    if (isDelete) {
      careEpisodes$[id]._syncedDelete.set(true);
    } else {
      careEpisodes$[id]._synced.set(true);
    }
    careEpisodes$[id]._syncState?.set?.("synced");
    return "synced";
  }

  if (error.code === FK_VIOLATION) {
    return "skipped"; // waiting on person to sync first
  }

  if (error.code === INVALID_DATE_FORMAT) {
    console.warn(`[CareEpisodes] Invalid date for ${id}, clearing...`);
    careEpisodes$[id].set({
      ...episode,
      expected_end_date: null,
      _synced: false,
    });
    return "failed";
  }

  careEpisodes$[id]._syncState?.set?.("failed");
  console.error(`[CareEpisodes] Failed to ${action} ${id}:`, error);
  return "failed";
}

export async function syncCareEpisodesToSupabase() {
  if (isCareEpisodesSyncing$.get()) return;

  setCareEpisodesSyncing(true);

  try {
    const all = Object.entries(careEpisodes$.get() ?? {}) as [
      string,
      CareEpisode,
    ][];
    const counts: Record<SyncOutcome, number> = {
      synced: 0,
      skipped: 0,
      failed: 0,
    };

    for (const [id, episode] of all) {
      const outcome = await syncSingleCareEpisode(id, episode);
      counts[outcome]++;
    }

    setCareEpisodesLastSync(new Date().toISOString());

    if (counts.skipped > 0) {
      offlineSyncManager.scheduleRetry(
        "care-episodes-retry-fk",
        syncCareEpisodesToSupabase,
        2000,
      );
    } else if (counts.failed > 0) {
      offlineSyncManager.scheduleRetry(
        "care-episodes-retry",
        syncCareEpisodesToSupabase,
        5000,
      );
    } else {
      offlineSyncManager.cancelRetry("care-episodes-retry-fk");
      offlineSyncManager.cancelRetry("care-episodes-retry");
    }
  } catch (error) {
    console.error("[CareEpisodes] Error during sync:", error);
  } finally {
    setCareEpisodesSyncing(false);
  }
}

// =========================================================
// MUTATIONS & QUERIES
// =========================================================

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

export async function initializeCareEpisodes() {
  await loadCareEpisodesFromStorage();
  await getCareEpisodes();

  offlineSyncManager.register("care-episodes", {
    onForeground: async () => {
      await syncCareEpisodesToSupabase();
      await getCareEpisodes();
    },
  });

  setTimeout(() => syncCareEpisodesToSupabase(), 2000);
}
