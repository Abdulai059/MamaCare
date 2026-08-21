import {
  isCareEpisodesSyncing$,
  setCareEpisodesSyncing,
  setCareEpisodesLastSync,
  careEpisodes$,
} from "@/state/careEpisodes";
import { offlineSyncManager } from "@/services/offlineSync";
import {
  upsertCareEpisodeToSupabase,
  deleteCareEpisodeFromSupabase,
} from "@/repositories/careEpisodes.repository";
import type { CareEpisode } from "@/utils/types/careEpisode";

const FK_VIOLATION = "23503";
const INVALID_DATE_FORMAT = "22007";

type SyncOutcome = "synced" | "skipped" | "failed";

function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

async function syncSingleCareEpisode(
  id: string,
  episode: CareEpisode,
): Promise<SyncOutcome> {
  const isDelete = Boolean(episode.deleted_at) && !episode._syncedDelete;
  const isUpsert = !episode.deleted_at && !episode._synced;

  if (!isDelete && !isUpsert) return "synced";

  const action = isDelete ? "delete" : "upsert";
  careEpisodes$[id]._syncState?.set?.("syncing");

  try {
    if (isDelete) {
      if (!episode.deleted_at) {
        throw new Error(
          "Cannot delete care episode without deleted_at timestamp",
        );
      }
      await deleteCareEpisodeFromSupabase(id, episode.deleted_at);
      careEpisodes$[id]._syncedDelete.set(true);
    } else {
      await upsertCareEpisodeToSupabase(episode);
      careEpisodes$[id]._synced.set(true);
    }
    careEpisodes$[id]._syncState?.set?.("synced");
    return "synced";
  } catch (error: any) {
    if (error.code === FK_VIOLATION) {
      return "skipped";
    }

    if (error.code === INVALID_DATE_FORMAT) {
      console.warn(`[CareEpisodes Sync] Invalid date for ${id}, clearing...`);
      careEpisodes$[id].set({
        ...episode,
        expected_end_date: null,
        _synced: false,
      });
      return "failed";
    }

    careEpisodes$[id]._syncState?.set?.("failed");
    console.error(`[CareEpisodes Sync] Failed to ${action} ${id}:`, error);
    return "failed";
  }
}

export async function syncCareEpisodesToSupabase() {
  const isSyncing = isCareEpisodesSyncing$.get();
  if (isSyncing) return;

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
    console.error("[CareEpisodes Sync] Error during sync:", error);
  } finally {
    setCareEpisodesSyncing(false);
  }
}
