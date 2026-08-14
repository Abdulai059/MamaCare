import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";

import { Colors } from "@/shared/constants/colors";
import { Household } from "@/utils/types/household";
import { PersonList } from "./PersonList";
import { useAllPersons } from "@/hooks/query/useAllPersons";

interface HouseholdDetailsProps {
  household: Household;
  onBack: () => void;
  onAddPerson: () => void;
}

export const HouseholdDetails = observer(function HouseholdDetails({
  household,
  onBack,
  onAddPerson,
}: HouseholdDetailsProps) {
  // Reactively fetch members with location details using household ID
  const persons = useAllPersons(household.id);

  return (
    <View>
      <View className="mb-4 rounded-2xl bg-white p-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => {}} hitSlop={8}>
            <Text
              className="rounded-sm bg-gray-300 px-4 py-1 text-sm text-brand-pink"
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack} hitSlop={8}>
            <Ionicons name="close" size={24} className="text-red-500" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Members */}
      <View className="mb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            className="text-base text-gray-800 uppercase"
            style={{
              fontFamily: "Poppins_600SemiBold",
            }}
          >
            Mother Details
          </Text>

          <TouchableOpacity
            onPress={onAddPerson}
            activeOpacity={0.8}
            className="rounded-sm bg-card-mint p-2"
          >
            <Ionicons name="add" size={20} className="text-dark" />
          </TouchableOpacity>
        </View>

        {/* Render enriched persons list */}
        <PersonList persons={persons} />
      </View>
    </View>
  );
});
