import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerMother } from "@/services/persons";
import { queryKeys } from "@/lib/queryKeys";

export function useRegisterMother(householdId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerMother,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.personsByHousehold(householdId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.householdDetail(householdId),
      });
    },
  });
}
