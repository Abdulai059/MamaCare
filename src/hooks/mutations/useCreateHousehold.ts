import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createHousehold } from "@/services/households";
import { queryKeys } from "@/lib/queryKeys";

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHousehold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.householdsList() });
    },
  });
}
