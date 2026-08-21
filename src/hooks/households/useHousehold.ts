import { use$ } from "@legendapp/state/react";
import { households$ } from "@/state/households";
import { selectHouseholdById } from "@/selectors/households/household.selectors";
import type { Household } from "@/utils/types/household";

export function useHousehold(householdId: string) {
  const households = use$(households$) || {};
  const household = selectHouseholdById(
    households as Record<string, Household>,
    householdId,
  );

  return household;
}
