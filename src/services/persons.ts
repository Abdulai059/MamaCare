import { supabase } from "@/lib/supabase";

export async function getMothersByHousehold(householdId: string) {
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("household_id", householdId)
    .eq("role", "MOTHER")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function registerMother(input: {
  household_id: string;
  first_name: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  preferred_language?: string;
  is_pregnant?: boolean;
}) {
  const { data, error } = await supabase
    .from("persons")
    .insert({ ...input, role: "MOTHER", gender: "FEMALE" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
