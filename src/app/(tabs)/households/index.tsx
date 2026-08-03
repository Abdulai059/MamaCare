import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useHouseholds } from "@/hooks/query/useHouseholds";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

function timeAgo(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getHouseholdStatus(item: any) {
  const pregnantCount =
    item.persons?.filter((p: any) => p.role === "MOTHER" && p.is_pregnant)
      .length ?? 0;
  const motherCount =
    item.persons?.filter((p: any) => p.role === "MOTHER").length ?? 0;

  if (pregnantCount > 0) return { label: "Active Pregnancy", color: "#3b82f6" };
  if (motherCount > 0) return { label: "Registered", color: "#22c55e" };
  return { label: "No Mother", color: "#9ca3af" };
}

function SkeletonCard() {
  return (
    <View className="py-4">
      <View className="flex-row items-center">
        <View className="w-11 h-11 rounded-full bg-gray-100 mr-3" />
        <View className="flex-1">
          <View className="h-3.5 w-32 bg-gray-100 rounded-full mb-2" />
          <View className="h-3 w-24 bg-gray-100 rounded-full" />
        </View>
      </View>
      <View className="h-[1px] bg-gray-100 mt-4" />
    </View>
  );
}

function HouseholdRow({ item, onPress }: { item: any; onPress: () => void }) {
  const status = getHouseholdStatus(item);
  const motherCount =
    item.persons?.filter((p: any) => p.role === "MOTHER").length ?? 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <View className="py-4">
        <View className="flex-row items-cente">
          <View
            className="rounded-full items-center justify-center mr-3"
            style={{ width: 44, height: 44, backgroundColor: "#c9e8d9" }}
          >
            <Text
              className="text-text-muted text-base"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              {item.household_code?.charAt(0)?.toUpperCase() || "H"}
            </Text>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center flex-wrap">
              <Text
                className="text-base text-gray-900"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                {item.household_code || `Household ${item.id.slice(0, 6)}`}
              </Text>
              {motherCount > 0 && (
                <Text
                  className="text-sm text-gray-400 ml-1"
                  style={{ fontFamily: "poppins" }}
                >
                  ({motherCount} mother{motherCount > 1 ? "s" : ""})
                </Text>
              )}
            </View>
            <Text
              className="text-sm text-gray-400 mt-0.5"
              style={{ fontFamily: "poppins" }}
            >
              {item.communities?.name || "No community"} ·{" "}
              {item.house_number || "—"}
            </Text>
          </View>

          <TouchableOpacity hitSlop={10}>
            <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center">
            <Text
              className="text-sm text-gray-400 mr-2"
              style={{ fontFamily: "poppins" }}
            >
              Status
            </Text>
            <Text
              className="text-sm"
              style={{ fontFamily: "poppinsSemiBold", color: status.color }}
            >
              {status.label}
            </Text>
          </View>
          <Text
            className="text-sm text-gray-400"
            style={{ fontFamily: "poppins" }}
          >
            {timeAgo(item.created_at)}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-gray-100" />
    </TouchableOpacity>
  );
}

export default function HouseholdsScreen(): React.JSX.Element {
  const router = useRouter();
  const { data: households = [], isLoading } = useHouseholds();
  const [search, setSearch] = useState("");

  const filtered = households.filter(
    (h: any) =>
      (h.household_code ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (h.communities?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const totalMothers = households.reduce(
    (sum: number, h: any) =>
      sum + (h.persons?.filter((p: any) => p.role === "MOTHER").length ?? 0),
    0,
  );
  const totalPregnant = households.reduce(
    (sum: number, h: any) =>
      sum +
      (h.persons?.filter((p: any) => p.role === "MOTHER" && p.is_pregnant)
        .length ?? 0),
    0,
  );

  const handleCreateHousehold = () => router.push("/households/create");
  const handleHouseholdPress = (id: string) => router.push(`/households/${id}`);

  return (
    <View className="flex-1 bg-surface-bg">
      <LinearGradient
        colors={["#ec1e88", "#f7638f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 24,
          paddingBottom: 20,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text
              className="text-2xl text-white"
              style={{ fontFamily: "poppinsBold" }}
            >
              Households
            </Text>
            <Text
              className="text-white/80 text-sm"
              style={{ fontFamily: "poppins" }}
            >
              Community registry
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCreateHousehold}
            className="w-11 h-11 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="flex-row bg-white/15 rounded-2xl p-4">
          <View className="flex-1 items-center">
            <Text
              className="text-white text-xl"
              style={{ fontFamily: "poppinsBold" }}
            >
              {households.length}
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: "poppins" }}
            >
              Households
            </Text>
          </View>
          <View className="w-px bg-white/20" />
          <View className="flex-1 items-center">
            <Text
              className="text-white text-xl"
              style={{ fontFamily: "poppinsBold" }}
            >
              {totalMothers}
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: "poppins" }}
            >
              Mothers
            </Text>
          </View>
          <View className="w-px bg-white/20" />
          <View className="flex-1 items-center">
            <Text
              className="text-white text-xl"
              style={{ fontFamily: "poppinsBold" }}
            >
              {totalPregnant}
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: "poppins" }}
            >
              Pregnant
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-6 -mt-4 mb-2">
        <View
          className="flex-row items-center bg-white rounded-full px-4"
          style={{
            height: 48,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
        >
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search households or communities..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-gray-900"
            style={{ fontFamily: "poppins" }}
          />
        </View>
      </View>

      {isLoading ? (
        <View className="px-6 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-surface-pink items-center justify-center mb-4">
            <Ionicons name="home-outline" size={36} color="#ec1e88" />
          </View>
          <Text
            className="text-lg text-gray-900 mb-2 text-center"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            {search ? "No matches found" : "No households yet"}
          </Text>
          <Text
            className="text-gray-500 text-center mb-8"
            style={{ fontFamily: "poppins" }}
          >
            {search
              ? "Try a different search term"
              : "Start by creating a new household in your community."}
          </Text>
          {!search && (
            <TouchableOpacity
              onPress={handleCreateHousehold}
              activeOpacity={0.85}
              className="rounded-full overflow-hidden"
              style={{
                shadowColor: "#ec1e88",
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={["#ec1e88", "#f7638f"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text
                  className="text-white text-base"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  Create Household
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 100,
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#e5e7eb" }} />
          )}
          renderItem={({ item }) => (
            <HouseholdRow
              item={item}
              onPress={() => handleHouseholdPress(item.id)}
            />
          )}
        />
      )}

      {filtered.length > 0 && (
        <TouchableOpacity
          onPress={handleCreateHousehold}
          activeOpacity={0.85}
          className="absolute bottom-6 right-6 rounded-full overflow-hidden"
          style={{
            shadowColor: "#ec1e88",
            shadowOpacity: 0.4,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={["#ec1e88", "#f7638f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}
