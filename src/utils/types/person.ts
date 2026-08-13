import { Syncable } from "@/utils/types/sync";

// =========================================================
// 1. BASE LOCATION ENTITIES
// =========================================================

export interface Region extends Syncable {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface District extends Syncable {
  id: string;
  region_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Community extends Syncable {
  id: string;
  district_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

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

// =========================================================
// 2. PERSON ENTITY
// =========================================================

export interface Person extends Syncable {
  id: string;
  household_id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  gender: "MALE" | "FEMALE" | null;
  phone: string | null;
  preferred_language: string | null;
  role: "MOTHER" | "CHILD" | "CAREGIVER";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =========================================================
// 3. ENRICHED COMPOSITE TYPE (FOR UI / PERSONLIST)
// =========================================================

export interface PersonAllLocation extends Person {
  household?: Household | null;
  community?: Community | null;
  district?: District | null;
  region?: Region | null;
}
