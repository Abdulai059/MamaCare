import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recordDelivery } from "@/services/delivery";
import { queryKeys } from "@/lib/queryKeys";

export interface RecordDeliveryInput {
  pregnancy_episode_id: string;
  mother_id: string;
  delivery_date: string;
  delivery_type: string;
  complications?: string;
  mother_outcome: string;
  baby_weight_grams?: number;
  baby_sex: "MALE" | "FEMALE";
  apgar_score?: number;
}

/**
 * Mutation hook to record delivery and automatically create postnatal + newborn episodes
 */
export function useRecordDelivery(motherId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordDelivery,
    onSuccess: () => {
      if (motherId) {
        // Invalidate all mother-related queries
        queryClient.invalidateQueries({
          queryKey: queryKeys.activeEpisodes(motherId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.pregnancyEpisode(motherId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.overdueMilestones(motherId),
        });
      }
      // Invalidate dashboard stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboardStats(),
      });
    },
  });
}
