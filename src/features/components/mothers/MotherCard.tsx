import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type CareStatus = "Pregnant" | "Postpartum" | "Not pregnant" | "Lactating";

interface MotherCardProps {
  name: string;
  gender: string;
  age: number;
  householdCode: string;
  phone: string;
  language: string;
  careStatus: CareStatus;
  edd?: string; // Estimated Due Date, only relevant if pregnant
  onViewProfile: () => void;
}

const STATUS_COLORS: Record<
  CareStatus,
  { bg: string; text: string; dot: string }
> = {
  Pregnant: { bg: "#fce7f3", text: "#be185d", dot: "#ec4899" },
  Postpartum: { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  Lactating: { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b" },
  "Not pregnant": { bg: "#f3f4f6", text: "#4b5563", dot: "#9ca3af" },
};

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-row items-center">
        <View className="w-7 h-7 rounded-full bg-gray-50 items-center justify-center mr-2.5">
          <Ionicons name={icon} size={13} color="#9ca3af" />
        </View>
        <Text
          className="text-xs text-gray-400"
          style={{ fontFamily: "poppins" }}
        >
          {label}
        </Text>
      </View>
      <Text
        className="text-sm text-gray-800"
        style={{ fontFamily: "Poppins_600SemiBold" }}
      >
        {value}
      </Text>
    </View>
  );
}

export function MotherCard({
  name,
  gender,
  age,
  householdCode,
  phone,
  language,
  careStatus,
  edd,
  onViewProfile,
}: MotherCardProps) {
  const status = STATUS_COLORS[careStatus];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      className="bg-white rounded-3xl overflow-hidden mb-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      {/* Header strip */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-white/50 items-center justify-center mr-3">
              <Text
                className="text-base text-gray-800"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                {initials}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className="text-lg text-gray-900"
                style={{ fontFamily: "poppinsBold" }}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text
                className="text-xs text-gray-600 mt-0.5"
                style={{ fontFamily: "poppins" }}
              >
                {gender} • {age} years
              </Text>
            </View>
          </View>

          <View
            className="flex-row items-center rounded-full px-3 py-1.5 ml-2"
            style={{ backgroundColor: status.bg }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: status.dot }}
            />
            <Text
              className="text-xs"
              style={{ fontFamily: "Poppins_600SemiBold", color: status.text }}
            >
              {careStatus}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Details */}
      <View className="px-5 pt-3 pb-1">
        <InfoRow icon="key-outline" label="Household" value={householdCode} />
        <View className="h-px bg-gray-50" />
        <InfoRow icon="call-outline" label="Phone" value={phone} />
        <View className="h-px bg-gray-50" />
        <InfoRow icon="language-outline" label="Language" value={language} />

        {careStatus === "Pregnant" && edd && (
          <>
            <View className="h-px bg-gray-50" />
            <InfoRow icon="calendar-outline" label="EDD" value={edd} />
          </>
        )}
      </View>

      {/* CTA */}
      <View className="px-5 pb-5 pt-3">
        <TouchableOpacity
          onPress={onViewProfile}
          activeOpacity={0.85}
          className="flex-row items-center justify-center bg-gray-900 rounded-full py-3.5"
        >
          <Text
            className="text-sm text-white mr-1.5"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            View Profile
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
