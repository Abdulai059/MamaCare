import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useCreateHousehold } from "@/hooks/mutations/useCreateHousehold";
import { useAuth } from "@/hooks/providers/AuthProvider";

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const [householdCode, setHouseholdCode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");

  const { mutate: createHousehold, isPending } = useCreateHousehold();

  const handleSubmit = () => {
    if (!profile?.chps_compound_id) {
      Alert.alert("Error", "Your account has no assigned CHPS compound.");
      return;
    }

    createHousehold(
      {
        community_id: profile.chps_compound_id, // see note below
        chps_compound_id: profile.chps_compound_id,
        household_code: householdCode || undefined,
        house_number: houseNumber || undefined,
        gps_location: gpsLocation || undefined,
      },
      {
        onSuccess: (household) => {
          router.replace(`/households/${household.id}`);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      },
    );
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-6">
      <Text className="text-xl font-bold text-gray-900 mb-6">
        Register Household
      </Text>

      <TextInput
        placeholder="Household code (optional)"
        value={householdCode}
        onChangeText={setHouseholdCode}
        className="border border-gray-200 rounded-lg px-4 py-3 mb-3"
      />
      <TextInput
        placeholder="House number"
        value={houseNumber}
        onChangeText={setHouseNumber}
        className="border border-gray-200 rounded-lg px-4 py-3 mb-3"
      />
      <TextInput
        placeholder="GPS location"
        value={gpsLocation}
        onChangeText={setGpsLocation}
        className="border border-gray-200 rounded-lg px-4 py-3 mb-6"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isPending}
        className={`py-4 rounded-full ${isPending ? "bg-pink-300" : "bg-pink-500"}`}
      >
        <Text className="text-white text-center font-semibold">
          {isPending ? "Saving..." : "Create Household"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
