import { v4 as uuidv4 } from "uuid";
import { batch } from "@legendapp/state";
import { households$ } from "@/state/households";
import { assignedCommunityIds$ } from "@/state/auth";
import { syncHouseholdsToSupabase } from "@/services/sync/households.sync";
import type { Household } from "@/utils/types/household";

type UpdateHouseholdInput = Partial<
  Pick<
    Household,
    "household_code" | "address_description" | "latitude" | "longitude"
  >
>;

function syncInBackground() {
  syncHouseholdsToSupabase().catch((error) => {
    console.error("[Households Operations] Background sync error:", error);
  });
}

export async function createHousehold(data: {
  household_code: string;
  address_description?: string;
  latitude?: number;
  longitude?: number;
}): Promise<string> {
  const communityIds = assignedCommunityIds$.get();
  if (!communityIds || communityIds.length === 0) {
    throw new Error("No assigned community");
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  const household: Household = {
    id,
    household_code: data.household_code,
    community_id: communityIds[0],
    address_description: data.address_description ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    _synced: false,
    _syncedDelete: false,
    _syncState: "pending",
  };

  batch(() => {
    households$[id].set(household);
  });

  syncInBackground();

  return id;
}

export async function updateHousehold(
  id: string,
  data: UpdateHouseholdInput,
): Promise<void> {
  const current = households$[id].get();
  if (!current) {
    throw new Error("Household not found");
  }

  batch(() => {
    households$[id].set({
      ...current,
      ...data,
      updated_at: new Date().toISOString(),
      _synced: false,
      _syncState: "pending",
    });
  });

  syncInBackground();
}

export async function deleteHousehold(id: string): Promise<void> {
  const current = households$[id].get();
  if (!current) {
    throw new Error("Household not found");
  }

  batch(() => {
    households$[id].set({
      ...current,
      deleted_at: new Date().toISOString(),
      _synced: false,
      _syncedDelete: false,
      _syncState: "pending",
    });
  });

  syncInBackground();
}
