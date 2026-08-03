import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useCreateHousehold } from "@/hooks/mutations/useCreateHousehold";
import {
  useCommunities,
  useCompoundsByCommunity,
} from "@/hooks/query/useCommunities";
import { SelectField } from "@/features/onboarding/components/SelectField";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import InputField from "@/features/ui/InputField";

interface Option {
  id: string;
  name: string;
}

export default function CreateHouseholdScreen() {
  const router = useRouter();
  const [community, setCommunity] = useState<Option | null>(null);
  const [compound, setCompound] = useState<Option | null>(null);
  const [householdCode, setHouseholdCode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");

  const { data: communities = [] } = useCommunities();
  const { data: compounds = [] } = useCompoundsByCommunity(community?.id ?? "");
  const { mutate: createHousehold, isPending } = useCreateHousehold();

  const isValid = !!community && !!compound;

  const handleSubmit = () => {
    if (!community || !compound) {
      Alert.alert(
        "Missing info",
        "Please select a community and CHPS compound.",
      );
      return;
    }

    createHousehold(
      {
        community_id: community.id,
        chps_compound_id: compound.id,
        household_code: householdCode || undefined,
        house_number: houseNumber || undefined,
        gps_location: gpsLocation || undefined,
      },
      {
        onSuccess: (household) => {
          router.replace(`/households/${household.id}`);
        },
        onError: (error: any) => {
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
            <Ionicons name="home-outline" size={20} color="#000" />
          </View>
          <View>
            <Text
              className="text-2xl text-main font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              New Household
            </Text>
            <Text
              className="text-gray text-sm"
              style={{ fontFamily: "poppins" }}
            >
              Register a household in the registry
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Location section */}
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
            <Ionicons name="map-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              LOCATION
            </Text>
          </View>

          <SelectField
            label="Community"
            placeholder="Select a community"
            value={community}
            options={communities}
            icon="business-outline"
            onSelect={(option) => {
              setCommunity(option);
              setCompound(null);
            }}
          />

          <SelectField
            label="CHPS Compound"
            placeholder={
              community ? "Select a compound" : "Select a community first"
            }
            value={compound}
            options={compounds}
            icon="medkit-outline"
            onSelect={setCompound}
            disabled={!community}
          />
        </View>

        {/* Household details section */}
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
              HOUSEHOLD DETAILS
            </Text>
          </View>

          <InputField
            label="GPS Number"
            icon="barcode-outline"
            placeholder="GHA-543-0125"
            value={householdCode}
            onChangeText={setHouseholdCode}
          />
          <InputField
            label="House Number"
            icon="pin-outline"
            placeholder="e.g. Plot 12"
            value={houseNumber}
            onChangeText={setHouseNumber}
          />
          <InputField
            label="GPS Location"
            icon="navigate-outline"
            placeholder="Tap to capture coordinates"
            value={gpsLocation}
            onChangeText={setGpsLocation}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isPending}
          activeOpacity={0.85}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: "#f259ce",
            shadowOpacity: isValid ? 0.35 : 0,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: isValid ? 4 : 0,
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
              {isPending ? "Saving Household..." : "Create Household"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
