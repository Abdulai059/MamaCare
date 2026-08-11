import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAllMothers } from "@/hooks/query/usePersons";
import { useHouseholds } from "@/hooks/query/useHouseholds";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StatCard from "@/features/ui/StatCard";
import DoctorsCarousel from "@/features/ui/DoctorsCarousel";
import { HeaderSection } from "@/features/ui/HeaderSection";

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { data: mothers = [], isLoading: mothersLoading } = useAllMothers();
  const { data: households = [], isLoading: householdsLoading } =
    useHouseholds();

  const isLoading = mothersLoading || householdsLoading;
  const totalMothers = mothers.length;
  const pregnantCount = mothers.filter((m) => m.is_pregnant).length;
  const totalHouseholds = households.length;

  const handleAddHousehold = () => {
    router.push("/mothers/create");
  };

  const handleAddMother = () => {
    router.push("/mothers/create");
  };

  const handleViewMothers = () => {
    router.push("/mothers");
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1 }}
      className="bg-surface-bg"
    >
      {/* Header */}
      {/* <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 8,
          paddingBottom: 20,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: "poppinsBold" }}
            >
              Welcome
            </Text>
            <Text
              className="text-gray-600 text-sm mt-1"
              style={{ fontFamily: "poppins" }}
            >
              Care Coordination Platform
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleAddHousehold}
            className="w-12 h-12 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient> */}

      <View>
        <HeaderSection />
      </View>

      <View>
        <DoctorsCarousel />
      </View>
    </SafeAreaView>
  );
}
