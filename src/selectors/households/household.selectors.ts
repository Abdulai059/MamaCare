import type { Household } from "@/utils/types/household";

export function selectHouseholdsByCommunity(
  households: Record<string, Household>,
  communityId: string,
): Household[] {
  return Object.values(households).filter(
    (household) =>
      household.community_id === communityId && !household.deleted_at,
  );
}

export function selectActiveHouseholds(
  households: Record<string, Household>,
): Household[] {
  return Object.values(households).filter((household) => !household.deleted_at);
}

export function selectHouseholdById(
  households: Record<string, Household>,
  householdId: string,
): Household | null {
  const household = households[householdId];
  return household && !household.deleted_at ? household : null;
}

export function selectPendingHouseholds(
  households: Record<string, Household>,
): Household[] {
  return Object.values(households).filter(
    (household) =>
      !household.deleted_at &&
      (!household._synced || household._syncState === "pending"),
  );
}
