// app/(tabs)/households/[id].tsx
import React from "react";
import { View, Text, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useHousehold } from "@/hooks/query/useHouseholds";

export default function HouseholdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: household, isLoading } = useHousehold(id);

  if (isLoading || !household) return null;

  return (
    <View className="flex-1 bg-white px-6 pt-4">
      <Text className="text-xl font-bold text-gray-900">
        {household.household_code}
      </Text>
      <Text className="text-sm text-gray-500 mb-6">
        {household.communities?.name}
      </Text>

      <Text className="text-base font-semibold text-gray-800 mb-2">
        Members
      </Text>
      <FlatList
        data={household.persons}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Text className="py-2 text-gray-700">
            {item.first_name} {item.last_name} — {item.role}
          </Text>
        )}
      />
    </View>
  );
}