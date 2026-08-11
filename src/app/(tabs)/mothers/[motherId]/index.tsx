import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
// import { useMother } from "@/hooks/query/usePersons";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function MotherDetailScreen(): React.JSX.Element {
  const router = useRouter();
  const { motherId } = useLocalSearchParams<{ motherId: string }>();

  // const { data: mother, isLoading, error } = useMother(motherId ?? "");
  const mother = null;
  const isLoading = false;
  const error = new Error("Data fetching temporarily disabled");

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1 }}
        className="bg-surface-bg items-center justify-center"
      >
        <ActivityIndicator size="large" color="#f259ce" />
      </SafeAreaView>
    );
  }

  if (error || !mother) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1 }}
        className="bg-surface-bg"
      >
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
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text
            className="text-2xl text-white font-bold"
            style={{ fontFamily: "poppinsBold" }}
          >
            Mother Not Found
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1 }}
      className="bg-surface-bg"
    >
      {/* Header */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 16,
          paddingBottom: 20,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center mb-2">
          <View className="w-14 h-14 rounded-full bg-white/30 items-center justify-center mr-3">
            <Ionicons name="person-circle" size={32} color="#fff" />
          </View>
          <View className="flex-1">
            <Text
              className="text-2xl text-white font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              {mother.first_name} {mother.last_name ?? ""}
            </Text>
            <Text
              className="text-white/80 text-sm"
              style={{ fontFamily: "poppins" }}
            >
              {mother.households?.communities?.name}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingVertical: 20,
          paddingHorizontal: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Information */}
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
            <Ionicons name="person-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2 font-semibold"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              PERSONAL INFORMATION
            </Text>
          </View>

          <View className="space-y-3">
            {mother.date_of_birth && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                  <Text
                    className="text-gray-600 text-sm ml-3"
                    style={{ fontFamily: "poppins" }}
                  >
                    Age
                  </Text>
                </View>
                <Text
                  className="text-text-main font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  {calculateAge(mother.date_of_birth)} years
                </Text>
              </View>
            )}

            {mother.phone && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="call-outline" size={16} color="#9ca3af" />
                  <Text
                    className="text-gray-600 text-sm ml-3"
                    style={{ fontFamily: "poppins" }}
                  >
                    Phone
                  </Text>
                </View>
                <Text
                  className="text-text-main font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  {mother.phone}
                </Text>
              </View>
            )}

            {mother.preferred_language && (
              <View className="flex-row justify-between items-center py-3">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="language-outline" size={16} color="#9ca3af" />
                  <Text
                    className="text-gray-600 text-sm ml-3"
                    style={{ fontFamily: "poppins" }}
                  >
                    Preferred Language
                  </Text>
                </View>
                <Text
                  className="text-text-main font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  {mother.preferred_language}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Household Information */}
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
            <Ionicons name="home-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2 font-semibold"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              HOUSEHOLD INFORMATION
            </Text>
          </View>

          <View className="space-y-3">
            {mother.households?.household_code && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="map-outline" size={16} color="#9ca3af" />
                  <Text
                    className="text-gray-600 text-sm ml-3"
                    style={{ fontFamily: "poppins" }}
                  >
                    Household Code
                  </Text>
                </View>
                <Text
                  className="text-text-main font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  {mother.households.household_code}
                </Text>
              </View>
            )}

            {mother.households?.communities?.name && (
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="location-outline" size={16} color="#9ca3af" />
                  <Text
                    className="text-gray-600 text-sm ml-3"
                    style={{ fontFamily: "poppins" }}
                  >
                    Community
                  </Text>
                </View>
                <Text
                  className="text-text-main font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  {mother.households.communities.name}
                </Text>
              </View>
            )}

            {mother.households?.chps_compounds?.name && (
              <View className="flex-row justify-between items-center py-3">
                <View className="flex-row items-center flex-1">
                  <Ionicons name="medkit-outline" size={16} color="#9ca3af" />
                  <Text
                    className="text-gray-600 text-sm ml-3"
                    style={{ fontFamily: "poppins" }}
                  >
                    CHPS Compound
                  </Text>
                </View>
                <Text
                  className="text-text-main font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  {mother.households.chps_compounds.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Pregnancy Information (if pregnant) */}
        {mother.is_pregnant && (
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
              <Ionicons name="heart-outline" size={16} color="#ec1e88" />
              <Text
                className="text-brand-primary text-sm ml-2 font-semibold"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                PREGNANCY INFORMATION
              </Text>
            </View>

            <View className="space-y-3">
              {mother.lmp_date && (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#9ca3af"
                    />
                    <Text
                      className="text-gray-600 text-sm ml-3"
                      style={{ fontFamily: "poppins" }}
                    >
                      Last Menstrual Period
                    </Text>
                  </View>
                  <Text
                    className="text-text-main font-semibold text-sm"
                    style={{ fontFamily: "poppinsSemiBold" }}
                  >
                    {formatDate(mother.lmp_date)}
                  </Text>
                </View>
              )}

              {mother.edd_date && (
                <View className="flex-row justify-between items-center py-3">
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color="#9ca3af"
                    />
                    <Text
                      className="text-gray-600 text-sm ml-3"
                      style={{ fontFamily: "poppins" }}
                    >
                      Estimated Delivery Date
                    </Text>
                  </View>
                  <Text
                    className="text-text-main font-semibold text-sm"
                    style={{ fontFamily: "poppinsSemiBold" }}
                  >
                    {formatDate(mother.edd_date)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
