// app/(tabs)/households/[id].tsx
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHousehold } from "@/hooks/query/useHouseholds";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function HouseholdDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: household, isLoading } = useHousehold(id);

  if (isLoading || !household) return null;

  const mother = household.persons?.find((p: any) => p.role === "MOTHER");

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
          <View className="flex-col gap-y-0.5">
            <Text
              className="text-lg text-main font-bold tracking-wide uppercase"
              style={{ fontFamily: "poppinsBold" }}
            >
              {household?.communities?.districts?.name ?? "N/A District"}
            </Text>

            <View className="flex-row items-center">
              <View
                className="rounded-full mr-1.5"
                style={{ width: 4, height: 4, backgroundColor: "#ec1e88" }}
              />
              <Text
                className="text-xs text-gray-500 font-medium tracking-wider uppercase"
                style={{ fontFamily: "poppins" }}
              >
                <Text className="font-semibold text-gray-700">COMMUNITY</Text>
                {" - "}
                {household?.communities?.name ?? "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View className="flex-1 px-6 pt-6">
        {/* Mother section */}
        <View className="shadow-card bg-white rounded-3xl p-5 mb-5">
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              MOTHER
            </Text>
          </View>

          {mother ? (
            <View className="py-2">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                {mother.first_name} {mother.last_name}
              </Text>

              <Text className="text-sm text-gray-500">{mother.phone}</Text>
            </View>
          ) : (
            <View className="py-4">
              <Text
                className="text-center text-gray-500 mb-4"
                style={{ fontFamily: "poppins" }}
              >
                No mother registered yet
              </Text>
              <TouchableOpacity
                onPress={() => router.push(`/households/${id}/registerMother`)}
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
                  colors={["#f259ce", "#f7638f"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    className="text-white text-sm"
                    style={{ fontFamily: "poppinsSemiBold" }}
                  >
                    Add Mother
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
