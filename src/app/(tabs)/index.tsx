import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useHouseholds } from "@/hooks/query/useHouseholds";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { data: households = [], isLoading } = useHouseholds();

  const recentHouseholds = households.slice(0, 5);

  const handleCreateHousehold = () => {
    router.push("/households/create");
  };

  const handleViewHouseholds = () => {
    router.push("/households");
  };

  const handleHouseholdPress = (id: string) => {
    router.push(`/households/${id}`);
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1 bg-surface-bg"
    >
      {/* Header */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 8,
          paddingBottom: 20,
          paddingHorizontal: 24,
        }}
      >
        <Text
          className="text-3xl font-bold text-gray-900 mt-2"
          style={{ fontFamily: "poppinsBold" }}
        >
          Welcome
        </Text>
        <Text
          className="text-gray-600 mt-1"
          style={{ fontFamily: "poppins" }}
        >
          Care Coordination Platform
        </Text>
      </LinearGradient>

      <View className="flex-1 px-6 pt-6">
        {/* Quick Actions */}
        <View
          className="bg-white rounded-3xl p-5 mb-6"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <Text
            className="text-sm font-semibold text-brand-primary mb-4 ml-1"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            QUICK ACTIONS
          </Text>
          <TouchableOpacity
            onPress={handleCreateHousehold}
            activeOpacity={0.7}
            className="mb-3"
          >
            <View
              className="bg-gradient-to-r rounded-2xl p-4 flex-row items-center"
              style={{
                backgroundColor: "#f0f9ff",
              }}
            >
              <View className="w-12 h-12 rounded-full bg-blue-200 items-center justify-center mr-4">
                <Ionicons name="add" size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  Create Household
                </Text>
                <Text
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "poppins" }}
                >
                  Register new household
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewHouseholds}
            activeOpacity={0.7}
          >
            <View
              className="bg-gradient-to-r rounded-2xl p-4 flex-row items-center"
              style={{
                backgroundColor: "#fef3c7",
              }}
            >
              <View className="w-12 h-12 rounded-full bg-amber-200 items-center justify-center mr-4">
                <Ionicons name="home" size={20} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-gray-900"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  View Households
                </Text>
                <Text
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "poppins" }}
                >
                  {households.length} registered
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Households */}
        {!isLoading && recentHouseholds.length > 0 && (
          <View>
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                Recent Households
              </Text>
              <TouchableOpacity onPress={handleViewHouseholds}>
                <Text
                  className="text-sm text-brand-primary"
                  style={{ fontFamily: "poppinsMedium" }}
                >
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentHouseholds}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleHouseholdPress(item.id)}
                  activeOpacity={0.7}
                  className="mb-3"
                >
                  <View
                    className="bg-white rounded-2xl p-4 flex-row items-center"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 1,
                    }}
                  >
                    <View className="w-10 h-10 rounded-full bg-pink-100 items-center justify-center mr-3">
                      <Ionicons name="home" size={18} color="#ec1e88" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-gray-900"
                        style={{ fontFamily: "poppinsSemiBold" }}
                      >
                        {item.household_code || `Household ${item.id.slice(0, 8)}`}
                      </Text>
                      <Text
                        className="text-xs text-gray-500"
                        style={{ fontFamily: "poppins" }}
                      >
                        {item.communities?.name}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {isLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#f259ce" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
