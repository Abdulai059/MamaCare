export type EpisodeType = "PREGNANCY" | "POSTNATAL" | "NEWBORN";
export type EpisodeStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type SyncState = "pending" | "syncing" | "synced" | "failed";

export interface CareEpisode {
  id: string;
  person_id: string;
  episode_type: EpisodeType;
  status: EpisodeStatus;
  start_date: string;
  expected_end_date: string | null;
  actual_end_date: string | null;
  parent_episode_id: string | null;
  created_by: string | null;
  created_at: string;
  notes: string | null;
  updated_at: string;
  deleted_at: string | null;
  _synced: boolean;
  _syncedDelete: boolean;
  _syncState: SyncState;
}
