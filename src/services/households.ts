import { supabase } from "@/lib/supabase";

export async function getHouseholds() {
  const { data, error } = await supabase
    .from("households")
    .select("*, communities(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getHouseholdById(id: string) {
  const { data, error } = await supabase
    .from("households")
    .select(
      `
      *,
      communities (
        name,
        districts (
          id,
          name
        )
      ),
      persons (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createHousehold(input: {
  community_id: string;
  chps_compound_id: string;
  household_code?: string;
  house_number?: string;
  gps_location?: string;
}) {
  const { data, error } = await supabase
    .from("households")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
