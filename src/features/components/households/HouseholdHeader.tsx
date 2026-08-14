import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HouseholdHeaderProps {
  onAdd: () => void;
}

export function HouseholdHeader({ onAdd }: HouseholdHeaderProps) {
  return (
    <View className="px-6 pb-5 pt-6">
      <View className="flex-row items-start justify-between">
        {/* Title + Description */}
        <View className="flex-1 pr-4">
          <Text
            className="text-2xl text-gray-900"
            style={{ fontFamily: "Poppins_700Bold" }}
          >
            Households
          </Text>

          <Text
            className="mt-1 text-sm leading-5 text-gray-500"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            Manage households and track {"\n"}the care journeys of mothers
          </Text>
        </View>

        {/* Add Household */}
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.8}
          className="flex-row items-center rounded-xl bg-card-mint px-3 py-1.5"
        >
          <Ionicons name="add" size={24} className="text-dark" />

          <Text
            className="ml-1 text-sm text-dark"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
