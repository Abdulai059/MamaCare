import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getHouseholdById, getHouseholds } from "@/services/households";

export function useHouseholds() {
  return useQuery({
    queryKey: queryKeys.householdsList(),
    queryFn: getHouseholds,
  });
}

export function useHousehold(id: string) {
  return useQuery({
    queryKey: queryKeys.householdDetail(id),
    queryFn: () => getHouseholdById(id),
    enabled: !!id,
  });
}
