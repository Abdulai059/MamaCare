// types/auth.ts
export type UserRole = "CHPS_WORKER" | "SUPERVISOR" | "ADMIN";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  assigned_community_id: string | null;
  assigned_district_id: string | null;
}
