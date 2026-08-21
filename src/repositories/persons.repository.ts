import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { Person } from "@/utils/types/person";

const STORAGE_KEY = "persons_local";

export async function loadPersons(): Promise<Record<string, Person>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[Persons Repository] Storage load error:", error);
    return {};
  }
}

export async function savePersons(persons: Record<string, Person>) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persons));
  } catch (error) {
    console.error("[Persons Repository] Storage save error:", error);
  }
}

export async function fetchPersons(householdIds: string[]): Promise<Person[]> {
  if (householdIds.length === 0) return [];

  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .in("household_id", householdIds);

  if (error) {
    console.error("[Persons Repository] Supabase fetch error:", error);
    throw error;
  }

  return data ?? [];
}

export async function upsertPersonToSupabase(person: Person): Promise<void> {
  const { error } = await supabase.from("persons").upsert({
    id: person.id,
    household_id: person.household_id,
    first_name: person.first_name,
    last_name: person.last_name,
    date_of_birth: person.date_of_birth,
    gender: person.gender,
    phone: person.phone,
    preferred_language: person.preferred_language,
    role: person.role,
    created_at: person.created_at,
    updated_at: person.updated_at,
  });

  if (error) {
    throw error;
  }
}

export async function deletePersonFromSupabase(
  id: string,
  deletedAt: string,
): Promise<void> {
  const { error } = await supabase
    .from("persons")
    .update({ deleted_at: deletedAt })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
