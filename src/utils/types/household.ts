// types/household.ts
import { Syncable } from "@/utils/types/sync";

export interface Household extends Syncable {
  id: string;
  household_code: string;
  community_id: string;
  address_description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
