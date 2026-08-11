import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import { useAllMothers } from "@/hooks/query/usePersons";
// import { useHouseholds } from "@/hooks/query/useHouseholds";
import StatCard from "@/features/ui/StatCard";
import Row from "@/features/ui/Row";

// --- Add mother card (matches stat card sizing, sits in the same scroll) ---
function AddMotherCard({ onPress }: { onPress: () => void }) {
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

export default function MothersScreen(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState("");
  // const { data: mothers, isLoading, isError } = useAllMothers();
  // const { data: households = [] } = useHouseholds();
  const mothers = [];
  const isLoading = false;
  const isError = false;
  const households = [];

  const filtered = mothers?.filter((m) =>
    `${m.first_name} ${m.last_name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const totalMothers = mothers?.length ?? 0;
  const pregnantCount = mothers?.filter((m) => m.is_pregnant).length ?? 0;
  const totalHouseholds = households.length;

  return (
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        style={{ flexGrow: 0 }}
        className="mb-6"
      >
        <StatCard
          label="Households"
          value={totalHouseholds}
          icon="home-outline"
          colors={["#fbbf24", "#f59e0b"]}
        />
        <StatCard
          label="Total Mothers"
          value={totalMothers}
          icon="people-outline"
          colors={["#ec1e88", "#f7638f"]}
        />
        <StatCard
          label="Pregnant"
          value={pregnantCount}
          icon="heart-outline"
          colors={["#68d3f8", "#4fb8e8"]}
        />
        <AddMotherCard onPress={() => router.push("/mothers/create")} />
      </ScrollView>

      {/* Search */}
      <View className="px-6 mb-4">
        <View className="flex-row items-center bg-surface-muted rounded-full px-4 py-3">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search mothers by name"
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-2 text-text-main"
            style={{ fontFamily: "poppins" }}
          />
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

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#ec1e88" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-text-muted" style={{ fontFamily: "poppins" }}>
              Couldn't load mothers. Pull to retry.
            </Text>
          </View>
        ) : filtered && filtered.length > 0 ? (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <Row
                name={`${item.first_name} ${item.last_name ?? ""}`.trim()}
                community={item.households?.communities?.name}
                isPregnant={item.is_pregnant}
                age={
                  item.date_of_birth
                    ? Math.floor(
                        (Date.now() - new Date(item.date_of_birth).getTime()) /
                          (1000 * 60 * 60 * 24 * 365),
                      )
                    : undefined
                }
                onPress={() => router.push(`/mothers/${item.id}`)}
              />
            )}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-surface-pink items-center justify-center mb-3">
              <Ionicons name="people-outline" size={28} color="#ec1e88" />
            </View>
            <Text
              className="text-text-main text-base mb-1"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              No mothers yet
            </Text>
            <Text
              className="text-text-muted text-sm text-center px-10"
              style={{ fontFamily: "poppins" }}
            >
              Tap "Add Mother" above to register your first mother
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
