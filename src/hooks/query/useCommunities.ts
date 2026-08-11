import { useQuery } from "@tanstack/react-query";
import {
  getCommunities,
  getCompoundsByCommunity,
} from "@/services/communities";
import { queryKeys } from "@/lib/queryKeys";

export function useCommunities() {
  return useQuery({
    queryKey: queryKeys.communitiesList(),
    queryFn: getCommunities,
  });
}

export function useCompoundsByCommunity(communityId: string) {
  return useQuery({
    queryKey: queryKeys.compoundsByCommunity(communityId),
    queryFn: () => getCompoundsByCommunity(communityId),
    enabled: !!communityId,
  });
}
