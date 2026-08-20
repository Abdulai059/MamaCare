import React, { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// --- Add mother card (matches stat card sizing, sits in the same scroll) ---
export default function AddMotherCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 140,
        height: 120,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#f7d9e3",
        borderStyle: "dashed",
      }}
      className="items-center justify-center bg-surface-pink"
    >
      <View className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center mb-2">
        <Ionicons name="add" size={22} color="#fff" />
      </View>
      <Text
        className="text-brand-primary text-xs"
        style={{ fontFamily: "poppinsSemiBold" }}
      >
        Add Mother
      </Text>
    </TouchableOpacity>
  );
}
