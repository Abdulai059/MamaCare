import { supabase } from "@/lib/supabase";

export async function getCommunities() {
  const { data, error } = await supabase
    .from("communities")
    .select("id, name")
    .order("name");

  if (error) throw error;
  return data;
}

export async function getCompoundsByCommunity(communityId: string) {
  const { data, error } = await supabase
    .from("chps_compounds")
    .select("id, name")
    .eq("community_id", communityId)
    .order("name");

  if (error) throw error;
  return data;
}
