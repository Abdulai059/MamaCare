import React from "react";
import { FlatList, View } from "react-native";
import { observer } from "@legendapp/state/react";
import { Household } from "@/utils/types/household";
import { usePersons } from "@/hooks/persons/usePersons";
import { selectPersonsByHousehold } from "@/selectors/persons/person.selectors";
import { EmptyState } from "@/features/ui/EmptyState";
import { HouseholdCard } from "./HouseholdCard";

interface HouseholdListProps {
  households: Household[];
  onSelect: (householdId: string) => void;
}

export const HouseholdList = observer(function HouseholdList({
  households,
  onSelect,
}: HouseholdListProps) {
  const { persons } = usePersons();

  if (households.length === 0) {
    return (
      <EmptyState
        icon="home-outline"
        title="No households yet"
        description="Tap the + button to create one"
      />
    );
  }

  return (
    <FlatList
      scrollEnabled={false}
      data={households}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const memberCount = selectPersonsByHousehold(persons, item.id).length;

        return (
          <HouseholdCard
            household={item}
            memberCount={memberCount}
            onPress={() => onSelect(item.id)}
          />
        );
      }}
    />
  );
});
