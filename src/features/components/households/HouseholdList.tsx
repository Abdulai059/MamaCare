import React from "react";
import { FlatList, View } from "react-native";
import { Household } from "@/utils/types/household";
import { getPersonsByHousehold } from "@/services/persons";
import { EmptyState } from "@/features/ui/EmptyState";
import { HouseholdCard } from "./HouseholdCard";

interface HouseholdListProps {
  households: Household[];
  onSelect: (householdId: string) => void;
}

export function HouseholdList({ households, onSelect }: HouseholdListProps) {
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
        const memberCount = getPersonsByHousehold(item.id).length;

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
}
