import { observable } from "@legendapp/state";
import { supabase } from "@/lib/supabase";

type UserRole = "CHPS_WORKER" | "SUPERVISOR" | "ADMIN";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  assigned_community_id: string | null;
  assigned_district_id: string | null;
}

// Currently logged-in user's profile, or null if signed out / not loaded yet
export const currentProfile$ = observable<Profile | null>(null);

// All community IDs the current user has access to
// (their primary assigned community + any extra worker_assignments)
export const assignedCommunityIds$ = observable<string[]>([]);

/**
 * Resets all auth-related observables back to their signed-out state.
 * Called on sign-out, on load errors, and when there's no active session.
 */
export function clearAuthState() {
  currentProfile$.set(null);
  assignedCommunityIds$.set([]);
}

/**
 * Call once on app startup to hydrate auth state and keep it in sync.
 * 1. Checks for an existing Supabase session and loads the profile if found.
 * 2. Subscribes to future auth changes (sign-in, sign-out, token refresh)
 *    so the profile stays up to date without manual refetching.
 */
export async function initializeAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    await loadProfile(session.user.id);
  }

  // Fire-and-forget: don't block the caller of initializeAuth() on
  // future auth events, just react to them as they happen.
  supabase.auth.onAuthStateChange((_event, newSession) => {
    if (newSession?.user?.id) {
      loadProfile(newSession.user.id);
    } else {
      clearAuthState();
    }
  });
}

/**
 * Fetches the profile row and the user's assigned community IDs,
 * then writes them into the observables. Falls back to a cleared
 * state if the profile doesn't exist or a request fails.
 */
async function loadProfile(userId: string) {
  try {
    const profile = await fetchProfile(userId);

    if (!profile) {
      // No profile row for this user — treat as signed out
      clearAuthState();
      return;
    }

    currentProfile$.set(profile);
    assignedCommunityIds$.set(await fetchAssignedCommunityIds(userId, profile));
  } catch (error) {
    console.error("Error loading auth profile:", error);
    clearAuthState();
  }
}

/** Fetches a single profile row by user id. Returns null if none exists. */
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Builds the full, deduplicated list of community IDs a user can access:
 * - their primary `assigned_community_id` from the profile row
 * - plus any extra rows in `worker_assignments`
 */
async function fetchAssignedCommunityIds(
  userId: string,
  profile: Profile,
): Promise<string[]> {
  const { data: assignments, error } = await supabase
    .from("worker_assignments")
    .select("community_id")
    .eq("worker_profile_id", userId);

  if (error) throw error;

  // Use a Set to avoid duplicate IDs if the primary community
  // also appears in worker_assignments
  const ids = new Set<string>();

  if (profile.assigned_community_id) {
    ids.add(profile.assigned_community_id);
  }

  assignments?.forEach((a) => {
    if (a.community_id) ids.add(a.community_id);
  });

  return [...ids];
}
