import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
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
  const { householdId } = useLocalSearchParams<{ householdId: string }>();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [lmpDate, setLmpDate] = useState<Date | null>(null);
  const [eddDate, setEddDate] = useState<Date | null>(null);
  const [showLmpPicker, setShowLmpPicker] = useState(false);
  const [showEddPicker, setShowEddPicker] = useState(false);

  const { mutate: registerMother, isPending } = useRegisterMother(householdId);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleDateOfBirthChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleLmpChange = (_event: any, selectedDate?: Date) => {
    setShowLmpPicker(Platform.OS === "ios");
    if (selectedDate) {
      setLmpDate(selectedDate);
      const edd = new Date(selectedDate);
      edd.setDate(edd.getDate() + 280);
      setEddDate(edd);
    }
  };

  const handleEddChange = (_event: any, selectedDate?: Date) => {
    setShowEddPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEddDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation", "First name is required");
      return;
    }

    if (isPregnant && (!lmpDate || !eddDate)) {
      Alert.alert("Validation", "Please enter LMP and EDD dates for pregnancy");
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
          : undefined,
        is_pregnant: isPregnant,
        lmp_date: lmpDate ? lmpDate.toISOString().split("T")[0] : undefined,
        edd_date: eddDate ? eddDate.toISOString().split("T")[0] : undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Mother registered with care journey created!");
          router.replace("/mothers");
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message);
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Header */}
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
        {/* Mother details */}
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
              onChange={handleDateOfBirthChange}
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

        {/* Pregnancy details (conditional) */}
        {isPregnant && (
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
              <Ionicons name="calendar-outline" size={16} color="#ec1e88" />
              <Text
                className="text-brand-primary text-sm ml-2"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                PREGNANCY DATES
              </Text>
            </View>

            {/* LMP */}
            <Text
              className="text-text-muted text-sm mb-2"
              style={{ fontFamily: "poppinsMedium" }}
            >
              Last Menstrual Period (LMP)
            </Text>
            <TouchableOpacity
              onPress={() => setShowLmpPicker(true)}
              className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
              style={{ backgroundColor: "#f2f4f7" }}
            >
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              <Text
                className="ml-3 text-base"
                style={{
                  fontFamily: "poppins",
                  color: lmpDate ? "#1a1a1a" : "#9ca3af",
                }}
              >
                {lmpDate ? formatDate(lmpDate) : "Select LMP date"}
              </Text>
            </TouchableOpacity>

            {showLmpPicker && (
              <DateTimePicker
                value={lmpDate || new Date(2024, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={handleLmpChange}
              />
            )}

            {/* EDD */}
            <Text
              className="text-text-muted text-sm mb-2"
              style={{ fontFamily: "poppinsMedium" }}
            >
              Estimated Delivery Date (EDD)
            </Text>
            <TouchableOpacity
              onPress={() => setShowEddPicker(true)}
              className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
              style={{ backgroundColor: "#f2f4f7" }}
            >
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              <Text
                className="ml-3 text-base"
                style={{
                  fontFamily: "poppins",
                  color: eddDate ? "#1a1a1a" : "#9ca3af",
                }}
              >
                {eddDate ? formatDate(eddDate) : "Auto-calculated from LMP"}
              </Text>
            </TouchableOpacity>

            {showEddPicker && (
              <DateTimePicker
                value={eddDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleEddChange}
              />
            )}

            <Text
              className="text-xs text-gray-400 mt-2"
              style={{ fontFamily: "poppins" }}
            >
              LMP will automatically calculate EDD (280 days)
            </Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.85}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: "#f259ce",
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={isPending ? ["#f4a8c6", "#f6b8ce"] : ["#f259ce", "#f7638f"]}
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
