// types/person.ts
import { PersonRole } from "@/state/persons";
import { Syncable } from "@/utils/types/sync";

export interface Person extends Syncable {
  id: string;
  household_id: string;
  first_name: string;
  last_name: string | null;
  date_of_birth: string | null;
  gender: "MALE" | "FEMALE" | null;
  phone: string | null;
  preferred_language: string | null;
  role: PersonRole;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
