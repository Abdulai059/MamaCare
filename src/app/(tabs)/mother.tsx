import React, { useMemo, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { observer } from "@legendapp/state/react";

import StatCard from "@/features/ui/StatCard";
import { MothersList } from "@/features/components/mothers/MothersList";
import AddMotherCard from "@/features/components/mothers/AddMotherCard";
import { useAllPersons } from "@/hooks/query/useAllPersons";
import { LinearGradient } from "expo-linear-gradient";

const MothersScreen = observer(function MothersScreen(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Get all persons (no role filter yet — treating everyone as a "mother" row for now)
  const allPersons = useAllPersons();

  const isLoading = false;
  const isError = false;

  const filtered = useMemo(
    () =>
      allPersons.filter((p: any) =>
        `${p.first_name ?? ""} ${p.last_name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [allPersons, search],
  );

  const totalMothers = allPersons.length;

  const pregnantCount = allPersons.filter(
    (p: any) => p.is_pregnant || p.care_status === "Pregnant",
  ).length;

  const totalHouseholds = useMemo(
    () =>
      new Set(allPersons.map((p: any) => p.household_id).filter(Boolean)).size,
    [allPersons],
  );

  return (
    <LinearGradient
      colors={["#dff3ea", "#fbe6f0"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1 }}
        className="bg-surface"
      >
        {/* Header */}
        <View className="px-6 pt-2 pb-4">
          <Text
            className="text-2xl text-text-main"
            style={{ fontFamily: "poppinsBold" }}
          >
            Mothers
          </Text>
          <Text
            className="text-text-muted text-sm mt-1"
            style={{ fontFamily: "poppins" }}
          >
            Registry & care tracking
          </Text>
        </View>

        {/* Stat carousel */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            style={{ flexGrow: 0 }}
            className="mb-6"
          >
            <StatCard
              label="Households"
              value={String(totalHouseholds)}
              icon="home-outline"
              colors={["#fbbf24", "#f59e0b"]}
            />
            <StatCard
              label="Total Mothers"
              value={String(totalMothers)}
              icon="people-outline"
              colors={["#ec1e88", "#f7638f"]}
            />
            <StatCard
              label="Pregnant"
              value={String(pregnantCount)}
              icon="heart-outline"
              colors={["#68d3f8", "#4fb8e8"]}
            />
            <AddMotherCard onPress={() => {}} />
          </ScrollView>
        </View>

        {/* Search */}
        <View className="px-6 my-6">
          <View
            className="flex-row items-center bg-white rounded-full px-4 py-1.75"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          >
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search mothers by name"
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-2 text-text-main"
              style={{ fontFamily: "poppins" }}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-surface-muted items-center justify-center ml-2"
            >
              <Ionicons name="options-outline" size={15} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <View className="flex-1 px-6">
          <Text
            className="text-text-main text-base mb-3"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            Registered Mothers
          </Text>

          <MothersList
            mothers={filtered}
            isLoading={isLoading}
            isError={isError}
            onSelectMother={(id) =>
              router.push({ pathname: "/(tabs)/mother/[id]", params: { id } })
            }
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
});

export default MothersScreen;
