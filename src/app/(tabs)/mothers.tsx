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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";

// --- API (inline for now, move to api/persons.ts) ---
async function fetchAllMothers() {
  const { data, error } = await supabase
    .from("persons")
    .select("*, households(household_code, communities(name))")
    .eq("role", "MOTHER")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

function useAllMothers() {
  return useQuery({
    queryKey: [...queryKeys.persons(), "all-mothers"],
    queryFn: fetchAllMothers,
  });
}

// --- Stat card ---
interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}

function StatCard({ label, value, icon, colors }: StatCardProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 140,
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        justifyContent: "space-between",
        height: 120,
      }}
    >
      <View className="w-9 h-9 rounded-full bg-white/25 items-center justify-center">
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <View>
        <Text
          className="text-white text-2xl"
          style={{ fontFamily: "poppinsBold" }}
        >
          {value}
        </Text>
        <Text
          className="text-white/85 text-xs mt-0.5"
          style={{ fontFamily: "poppinsMedium" }}
        >
          {label}
        </Text>
      </View>
    </LinearGradient>
  );
}

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

// --- Mother list row ---
interface MotherRowProps {
  name: string;
  community?: string;
  isPregnant: boolean;
  age?: number;
  onPress: () => void;
}

function MotherRow({
  name,
  community,
  isPregnant,
  age,
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
      className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      <View className="w-12 h-12 rounded-full bg-card-pink items-center justify-center mr-3">
        <Text
          className="text-brand-primary text-base"
          style={{ fontFamily: "poppinsSemiBold" }}
        >
          {initials}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          className="text-text-main text-base"
          style={{ fontFamily: "poppinsSemiBold" }}
        >
          {name}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Ionicons name="location-outline" size={12} color="#9ca3af" />
          <Text
            className="text-text-muted text-xs ml-1"
            style={{ fontFamily: "poppins" }}
          >
            {community ?? "No community"}
            {age ? ` • ${age} yrs` : ""}
          </Text>
        </View>
      </View>

      {isPregnant && (
        <View className="bg-card-mint rounded-full px-3 py-1 mr-2">
          <Text
            className="text-emerald-700 text-xs"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            Pregnant
          </Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
    </TouchableOpacity>
  );
}

export default function MothersScreen(): React.JSX.Element {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: mothers, isLoading, isError } = useAllMothers();

  const filtered = mothers?.filter((m) =>
    `${m.first_name} ${m.last_name ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const totalMothers = mothers?.length ?? 0;
  const pregnantCount = mothers?.filter((m) => m.is_pregnant).length ?? 0;

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
        className="mb-6"
      >
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
        <StatCard
          label="High Risk"
          value="0"
          icon="alert-circle-outline"
          colors={["#f97066", "#f04438"]}
        />
        <AddMotherCard onPress={() => router.push("/mothers/register")} />
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
              <MotherRow
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
