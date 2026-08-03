import { useQuery } from "@tanstack/react-query";
import { getMothersByHousehold } from "@/services/persons";
import { queryKeys } from "@/lib/queryKeys";

export function useMothersByHousehold(householdId: string) {
  return useQuery({
    queryKey: queryKeys.personsByHousehold(householdId),
    queryFn: () => getMothersByHousehold(householdId),
    enabled: !!householdId,
  });
}
