import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useHouseholds } from "@/hooks/query/useHouseholds";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Household {
  id: string;
  household_code?: string;
  communities?: { name: string };
  persons?: Array<{ role: string }>;
}

export default function CreateMotherScreen(): React.JSX.Element {
  const router = useRouter();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const { data: households = [], isLoading } = useHouseholds();

  const handleSelectHousehold = (householdId: string) => {
    setSelectedHouseholdId(householdId);
    // Navigate to mother registration with selected household
    router.push({
      pathname: "/mothers/create/mother",
      params: { householdId: householdId },
    });
  };

  const handleCreateNewHousehold = () => {
    // Navigate to create household flow (with fromMother flag)
    router.push({
      pathname: "/mothers/create/household",
      params: { fromMother: "true" },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator size="large" color="#ec1e88" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
      {/* Header */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 16,
          paddingBottom: 24,
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

        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-white/30 items-center justify-center mr-3">
            <Ionicons name="person-add-outline" size={20} color="#000" />
          </View>
          <View>
            <Text
              className="text-2xl text-main font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              Add Mother
            </Text>
            <Text
              className="text-gray text-sm"
              style={{ fontFamily: "poppins" }}
            >
              Select household or create new
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Create New Household Button */}
        <TouchableOpacity
          onPress={handleCreateNewHousehold}
          activeOpacity={0.85}
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            shadowColor: "#f259ce",
            shadowOpacity: 0.25,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <LinearGradient
            colors={["#f259ce", "#f7638f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <View className="flex-1">
              <Text
                className="text-white font-semibold"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                Create New Household
              </Text>
              <Text
                className="text-white/80 text-xs"
                style={{ fontFamily: "poppins" }}
              >
                Register a new household first
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Or Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text
            className="mx-3 text-gray-400 text-xs"
            style={{ fontFamily: "poppins" }}
          >
            OR
          </Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Select Existing Household */}
        <View>
          <Text
            className="text-sm font-semibold text-gray-900 mb-3"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            Select Household
          </Text>

          {households.length === 0 ? (
            <View className="bg-gray-50 rounded-2xl p-6 items-center">
              <Ionicons name="home-outline" size={32} color="#9ca3af" />
              <Text
                className="text-gray-500 text-center mt-2"
                style={{ fontFamily: "poppins" }}
              >
                No households yet. Create one above.
              </Text>
            </View>
          ) : (
            <FlatList
              data={households}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectHousehold(item.id)}
                  activeOpacity={0.7}
                  className="mb-3"
                >
                  <View
                    className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.03,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: 1,
                    }}
                  >
                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                      <Text
                        className="text-base font-bold text-blue-600"
                        style={{ fontFamily: "poppinsBold" }}
                      >
                        {(item.household_code || "H")[0]}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-base font-semibold text-gray-900"
                        style={{ fontFamily: "poppinsSemiBold" }}
                      >
                        {item.household_code || `Household ${item.id.slice(0, 6)}`}
                      </Text>
                      <Text
                        className="text-sm text-gray-500"
                        style={{ fontFamily: "poppins" }}
                      >
                        {item.communities?.name || "No community"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
