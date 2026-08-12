// types/sync.ts

/**
 * Lifecycle of a locally-created/updated/deleted record as it moves
 * through the offline sync pipeline to Supabase.
 */
export type SyncState = "pending" | "syncing" | "synced" | "failed";

/**
 * Fields every locally-synced entity carries alongside its own data.
 * Extend this rather than repeating the four `_...` fields per type.
 */
export interface Syncable {
  _synced: boolean;
  _syncedDelete: boolean;
  _syncState: SyncState;
}
