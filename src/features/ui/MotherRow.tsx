import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CareStatus = "Pregnant" | "Postpartum" | "Not pregnant" | "Lactating";

const STATUS_DOT: Record<CareStatus, string> = {
  Pregnant: "#ec4899",
  Postpartum: "#3b82f6",
  Lactating: "#f59e0b",
  "Not pregnant": "#9ca3af",
};

interface MotherRowProps {
  name: string;
  age: number;
  householdCode: string;
  careStatus: CareStatus;
  onPress: () => void;
}

export function MotherRow({
  name,
  age,
  householdCode,
  careStatus,
  onPress,
}: MotherRowProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="flex-row items-center px-5 py-3 bg-white border-b border-gray-50"
    >
      <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3">
        <Text
          className="text-xs text-gray-600"
          style={{ fontFamily: "Poppins_600SemiBold" }}
        >
          {initials}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          className="text-sm text-gray-900"
          style={{ fontFamily: "Poppins_600SemiBold" }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text
          className="text-xs text-gray-400 mt-0.5"
          style={{ fontFamily: "poppins" }}
        >
          {age} yrs • {householdCode}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: STATUS_DOT[careStatus] }}
        />
        <Text
          className="text-xs text-gray-500 mr-2"
          style={{ fontFamily: "poppins" }}
        >
          {careStatus}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );
}
