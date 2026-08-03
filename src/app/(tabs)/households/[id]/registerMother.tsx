// app/(tabs)/households/[id]/register-mother.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRegisterMother } from "@/hooks/mutations/useRegisterMother";

export default function RegisterMotherScreen() {
  const { id: householdId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const { mutate: registerMother, isPending } = useRegisterMother(householdId);

  const handleSubmit = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation", "First name is required");
      return;
    }

    registerMother(
      { household_id: householdId, first_name: firstName, last_name: lastName, phone },
      {
        onSuccess: () => {
          Alert.alert("Success", "Mother registered");
          router.back();
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-white px-6 pt-6">
      <Text className="text-xl font-bold text-gray-900 mb-6">Register Mother</Text>

      <TextInput
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
        className="border border-gray-200 rounded-lg px-4 py-3 mb-3"
      />
      <TextInput
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
        className="border border-gray-200 rounded-lg px-4 py-3 mb-3"
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        className="border border-gray-200 rounded-lg px-4 py-3 mb-6"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isPending}
        className={`py-4 rounded-full ${isPending ? "bg-pink-300" : "bg-pink-500"}`}
      >
        <Text className="text-white text-center font-semibold">
          {isPending ? "Saving..." : "Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}