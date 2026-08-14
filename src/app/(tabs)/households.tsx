import React, { useState } from "react";
import { View } from "react-native";
import { observer } from "@legendapp/state/react";
import { use$ } from "@legendapp/state/react";

import { ScreenScrollView } from "@/shared/context/ScreenScrollView";
import { households$ } from "@/state/households";
import { HouseholdHeader } from "@/features/components/households/HouseholdHeader";
import { HouseholdList } from "@/features/components/households/HouseholdList";
import { HouseholdDetails } from "@/features/components/households/HouseholdDetails";
import { CreateHouseholdModal } from "@/features/components/households/CreateHouseholdModal";
import { AddPersonModal } from "@/features/components/households/AddPersonModal";
import type { Household } from "@/utils/types/household";

function HouseholdsScreen() {
  // Use reactive observer hook to read households state safely
  const householdsData = use$(households$) ?? {};

  // Derive sorted active households list reactively (no useMemo - LegendApp handles this)
  const householdsList = Object.values(
    householdsData as Record<string, Household>,
  )
    .filter((h) => !h.deleted_at)
    .sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));

  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);

  // Derive selected household record dynamically
  const selectedHousehold = selectedHouseholdId
    ? (householdsList.find((h) => h.id === selectedHouseholdId) ?? null)
    : null;

  const handleSelectHousehold = (householdId: string) => {
    setSelectedHouseholdId(householdId);
  };

  const handleBack = () => {
    setSelectedHouseholdId(null);
    setShowPersonModal(false);
  };

  return (
    <ScreenScrollView>
      <HouseholdHeader onAdd={() => setShowCreateModal(true)} />

      <View className="px-6 pb-8">
        {selectedHousehold ? (
          <HouseholdDetails
            household={selectedHousehold}
            onBack={handleBack}
            onAddPerson={() => setShowPersonModal(true)}
          />
        ) : (
          <HouseholdList
            households={householdsList}
            onSelect={handleSelectHousehold}
          />
        )}
      </View>

      <CreateHouseholdModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {selectedHouseholdId ? (
        <AddPersonModal
          visible={showPersonModal}
          householdId={selectedHouseholdId}
          onClose={() => setShowPersonModal(false)}
        />
      ) : null}
    </ScreenScrollView>
  );
}

export default observer(HouseholdsScreen);
