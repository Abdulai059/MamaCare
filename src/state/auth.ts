import { observable } from "@legendapp/state";
import { supabase } from "@/lib/supabase";

export const currentProfile$ = observable<{
  id: string;
  email: string | null;
  full_name: string | null;
  role: "CHPS_WORKER" | "SUPERVISOR" | "ADMIN";
  assigned_community_id: string | null;
  assigned_district_id: string | null;
} | null>(null);

export const assignedCommunityIds$ = observable<string[]>([]);

export async function initializeAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    await loadProfile(session.user.id);
  }

  supabase.auth.onAuthStateChange(async (event, newSession) => {
    if (newSession?.user?.id) {
      await loadProfile(newSession.user.id);
    } else {
      currentProfile$.set(null);
      assignedCommunityIds$.set([]);
    }
  });
}

async function loadProfile(userId: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile) {
      currentProfile$.set(profile);

      // Load assigned communities
      const { data: assignments, error: assignError } = await supabase
        .from("worker_assignments")
        .select("community_id")
        .eq("worker_profile_id", userId);

      if (assignError) throw assignError;

      const communityIds: string[] = [];

      // Add primary assigned community
      if (profile.assigned_community_id) {
        communityIds.push(profile.assigned_community_id);
      }

      // Add additional assigned communities
      if (assignments && assignments.length > 0) {
        assignments.forEach((a) => {
          if (a.community_id && !communityIds.includes(a.community_id)) {
            communityIds.push(a.community_id);
          }
        });
      }

      assignedCommunityIds$.set(communityIds);
    }
  } catch (error) {
    console.error("Error loading auth profile:", error);
    currentProfile$.set(null);
    assignedCommunityIds$.set([]);
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentProfile$.set(null);
  assignedCommunityIds$.set([]);
}
