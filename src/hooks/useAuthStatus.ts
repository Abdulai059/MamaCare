import { useAuth } from "@/hooks/providers/AuthProvider";
import { useProfile } from "@/hooks/query/useProfile";

export function useAuthStatus() {
  const { session, isSessionLoading, ...auth } = useAuth();
  const userId = session?.user.id ?? null;
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(userId);

  const isAuthenticated = !!(
    session &&
    profile &&
    profile.role === "CHPS_WORKER"
  );
  const isLoading = isSessionLoading || (!!userId && isProfileLoading);

  return {
    ...auth,
    session,
    profile,
    isAuthenticated,
    isLoading,
    profileError,
  };
}
