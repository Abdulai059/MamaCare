// src/hooks/queries/useProfile.ts
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/auth";

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
