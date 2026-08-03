// app/(tabs)/households/[id]/register-mother.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRegisterMother } from "@/hooks/mutations/useRegisterMother";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import InputField from "@/features/ui/InputField";

export default function RegisterMotherScreen() {
  const { id: householdId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);

  const { mutate: registerMother, isPending } = useRegisterMother(householdId);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation", "First name is required");
      return;
    }

    registerMother(
      {
        household_id: householdId,
        first_name: firstName,
        last_name: lastName,
        phone,
        preferred_language: preferredLanguage,
        date_of_birth: dateOfBirth
          ? dateOfBirth.toISOString().split("T")[0]
          : null,
        is_pregnant: isPregnant,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Mother registered");
          router.replace(`/households/${householdId}`);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Gradient header */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 24,
          paddingBottom: 28,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 self-start"
        >
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center mb-2">
          <View className="w-11 h-11 rounded-full bg-white/30 items-center justify-center mr-3">
            <Ionicons name="person-add-outline" size={20} color="#000" />
          </View>
          <View>
            <Text
              className="text-2xl text-main font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              Register Mother
            </Text>
            <Text
              className="text-gray text-sm"
              style={{ fontFamily: "poppins" }}
            >
              Add a mother to this household
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mother details section */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="document-text-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              MOTHER DETAILS
            </Text>
          </View>

          <InputField
            label="First Name"
            icon="person-outline"
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <InputField
            label="Last Name"
            icon="person-outline"
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
          />
          <InputField
            label="Phone Number"
            icon="call-outline"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <InputField
            label="Preferred Language"
            icon="language-outline"
            placeholder="e.g. English, Twi, Ga"
            value={preferredLanguage}
            onChangeText={setPreferredLanguage}
          />

          {/* Date of birth */}
          <Text
            className="text-text-muted text-sm mb-2"
            style={{ fontFamily: "poppinsMedium" }}
          >
            Date of Birth
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
            style={{ backgroundColor: "#f2f4f7" }}
          >
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
            <Text
              className="ml-3 text-base"
              style={{
                fontFamily: "poppins",
                color: dateOfBirth ? "#1a1a1a" : "#9ca3af",
              }}
            >
              {dateOfBirth ? formatDate(dateOfBirth) : "Select date of birth"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(1995, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {/* Pregnancy toggle */}
          <View
            className="flex-row items-center justify-between rounded-2xl px-4 py-3 mt-1"
            style={{ backgroundColor: "#f2f4f7" }}
          >
            <View className="flex-row items-center">
              <Ionicons name="heart-outline" size={18} color="#9ca3af" />
              <Text
                className="ml-3 text-base text-text-main"
                style={{ fontFamily: "poppinsMedium" }}
              >
                Currently Pregnant
              </Text>
            </View>
            <Switch
              value={isPregnant}
              onValueChange={setIsPregnant}
              trackColor={{ false: "#e5e7eb", true: "#f7638f" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.85}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: "#ec1e88",
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={isPending ? ["#f4a8c6", "#f6b8ce"] : ["#ec1e88", "#f7638f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {!isPending && (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              className="text-white text-base"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              {isPending ? "Saving..." : "Register Mother"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
