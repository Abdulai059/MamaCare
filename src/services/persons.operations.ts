import { v4 as uuidv4 } from "uuid";
import { batch } from "@legendapp/state";
import { persons$ } from "@/state/persons";
import { syncPersonsToSupabase } from "@/services/sync/persons.sync";
import type { Person } from "@/utils/types/person";

function isValidDateFormat(date: string | null | undefined): boolean {
  if (!date) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function syncInBackground() {
  syncPersonsToSupabase().catch((error) => {
    console.error("[Persons Operations] Background sync error:", error);
  });
}

export async function createPerson(data: {
  household_id: string;
  first_name: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: "MALE" | "FEMALE";
  phone?: string;
  preferred_language?: string;
}): Promise<string> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const dob =
    data.date_of_birth && isValidDateFormat(data.date_of_birth)
      ? data.date_of_birth
      : null;

  const person: Person = {
    id,
    household_id: data.household_id,
    first_name: data.first_name,
    last_name: data.last_name || null,
    date_of_birth: dob,
    gender: data.gender || null,
    phone: data.phone || null,
    preferred_language: data.preferred_language || null,
    role: "MOTHER",
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  };

  batch(() => {
    persons$[id].set(person);
  });

  syncInBackground();

  return id;
}

export async function updatePerson(
  id: string,
  data: Partial<
    Pick<
      Person,
      | "first_name"
      | "last_name"
      | "date_of_birth"
      | "gender"
      | "phone"
      | "preferred_language"
    >
  >,
): Promise<void> {
  const current = persons$[id].get();
  if (!current) throw new Error("Person not found");

  const dob: string | null =
    data.date_of_birth && !isValidDateFormat(data.date_of_birth)
      ? null
      : data.date_of_birth || null;

  batch(() => {
    persons$[id].set({
      ...current,
      ...data,
      date_of_birth: dob,
      updated_at: new Date().toISOString(),
      _synced: false,
      _syncState: "pending",
    });
  });

  syncInBackground();
}

export async function deletePerson(id: string): Promise<void> {
  const current = persons$[id].get();
  if (!current) throw new Error("Person not found");

  batch(() => {
    persons$[id].set({
      ...current,
      deleted_at: new Date().toISOString(),
      _synced: false,
      _syncedDelete: false,
      _syncState: "pending",
    });
  });

  syncInBackground();
}
