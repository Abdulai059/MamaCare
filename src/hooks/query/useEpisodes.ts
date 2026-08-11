import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getActivePregnancyEpisode,
  getActiveEpisodes,
  getOverdueMilestones,
} from "@/services/episodes";

/**
 * Hook to fetch active pregnancy episode for a mother
 */
export function useActivePregnancyEpisode(personId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.pregnancyEpisode(personId || ""),
    queryFn: () => getActivePregnancyEpisode(personId!),
    enabled: !!personId,
  });
}

/**
 * Hook to fetch all active episodes (pregnancy, postnatal, newborn)
 */
export function useActiveEpisodes(personId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.activeEpisodes(personId || ""),
    queryFn: () => getActiveEpisodes(personId!),
    enabled: !!personId,
  });
}

/**
 * Hook to fetch overdue milestones for a mother
 */
export function useOverdueMilestones(personId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.overdueMilestones(personId || ""),
    queryFn: () => getOverdueMilestones(personId!),
    enabled: !!personId,
  });
}
