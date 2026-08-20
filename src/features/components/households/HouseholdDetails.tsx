import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";

import { Colors } from "@/shared/constants/colors";
import { Household } from "@/utils/types/household";
import { PersonList } from "./PersonList";
import { useAllPersons } from "@/hooks/query/useAllPersons";
import { PregnancyEpisode } from "../pregnancy/pregnancyEpisode";

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

  // Pregnancy care is tracked per-mother — pick the mother in this household
  const mother = persons[0];

  return (
    <View>
      {/* Members */}
      <View className="mb-4">
        <View className="mb-4 flex-row items-center justify-between p-2">
          <Text
            className="text-base text-gray-800 uppercase"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            Mother Details
          </Text>

          <View className="flex-row items-center gap-2 rounded-2xl bg-gray-100 p-2">
            {/* <TouchableOpacity onPress={() => {}} hitSlop={8}>
              <Text
                className="rounded-full bg-brand-blue px-4 py-1 text-sm text-dark"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Edit
              </Text>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={onAddPerson} activeOpacity={0.8}>
              <View className="flex-row items-center gap-1 rounded-full bg-brand-blue px-3 py-1.75">
                <Ionicons name="add" size={18} color="#1a1a1a" />
                <Text
                  className="text-sm text-dark"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  Mother
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onBack} hitSlop={8}>
              <Text
                className="rounded-full bg-red-500 px-4 py-1.75 text-sm text-white"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="rounded-xl bg-white shadow-sm">
          {/* Render enriched persons list */}
          <PersonList persons={persons} />

          {/* Pregnancy Episode — only render once a mother exists */}
          {mother ? <PregnancyEpisode personId={mother.id} /> : null}
        </View>
      </View>
    </View>
  );
});
