import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useActiveEpisodes } from "@/hooks/query/useEpisodes";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { EpisodeCard } from "@/features/careJourney/components/EpisodeCard";
import { MilestoneTimeline } from "@/features/careJourney/components/MilestoneTimeline";
import { SafeAreaView } from "react-native-safe-area-context";

interface Milestone {
  id: string;
  title: string;
  milestone_type: string;
  due_date: string;
  completed_date?: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE" | "DUE";
  milestone_sequence: number;
}

interface Episode {
  id: string;
  person_id: string;
  episode_type: "PREGNANCY" | "MOTHER_POSTNATAL" | "NEWBORN";
  start_date: string;
  expected_end_date?: string;
  status: string;
  care_plan_milestones: Milestone[];
}

export default function CareJourneyScreen(): React.JSX.Element {
  const router = useRouter();
  const { motherId: paramMotherId } = useLocalSearchParams<{
    motherId?: string;
  }>();
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null,
  );

  // Get motherId from route params (passed when navigating from mother's detail)
  // For demo/testing without params, this will be undefined and show empty state
  const motherId = paramMotherId;

  const { data: episodes = [], isLoading, error } = useActiveEpisodes(motherId);

  const selectedEpisode =
    episodes.find((e) => e.id === selectedEpisodeId) || episodes[0];

  const calculateCareStatus = () => {
    const allMilestones = episodes.flatMap((e) => e.care_plan_milestones || []);
    const completed = allMilestones.filter(
      (m) => m.status === "COMPLETED",
    ).length;
    const overdue = allMilestones.filter((m) => m.status === "OVERDUE").length;

    return { completed, overdue, total: allMilestones.length };
  };

  const status = calculateCareStatus();

  const handleMilestonePress = (milestoneId: string) => {
    // Navigate to milestone detail/recording screen
    router.push({
      pathname: "/careJourney/[milestoneId]/record",
      params: { milestoneId },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface-bg items-center justify-center">
        <ActivityIndicator size="large" color="#f259ce" />
      </SafeAreaView>
    );
  }

  if (error || episodes.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-bg">
        <LinearGradient
          colors={["#FDD47C", "#FDD47C"]}
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
          <Text
            className="text-2xl text-white font-bold"
            style={{ fontFamily: "poppinsBold" }}
          >
            Care Journey
          </Text>
          <Text
            className="text-white/80 text-sm mt-1"
            style={{ fontFamily: "poppins" }}
          >
            Track your pregnancy and postnatal care
          </Text>
        </LinearGradient>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="heart-outline" size={40} color="#9ca3af" />
          </View>
          <Text
            className="text-lg font-semibold text-gray-900 mb-2 text-center"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            No Active Care Journey
          </Text>
          <Text
            className="text-gray-500 text-center"
            style={{ fontFamily: "poppins" }}
          >
            Register as a pregnant mother to start your care journey.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
      {/* Header */}
      <LinearGradient
        colors={["#FDD47C", "#FDD47C"]}
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
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text
              className="text-2xl text-white font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              Care Journey
            </Text>
            <Text
              className="text-white/80 text-sm"
              style={{ fontFamily: "poppins" }}
            >
              {episodes.length} active episode{episodes.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row bg-white/15 rounded-2xl p-3 gap-2">
          <View className="flex-1 items-center">
            <Text
              className="text-white text-lg font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              {status.completed}
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: "poppins" }}
            >
              Completed
            </Text>
          </View>
          <View className="w-px bg-white/20" />
          <View className="flex-1 items-center">
            <Text
              className="text-white text-lg font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              {status.total}
            </Text>
            <Text
              className="text-white/80 text-xs"
              style={{ fontFamily: "poppins" }}
            >
              Total
            </Text>
          </View>
          <View className="w-px bg-white/20" />
          <View className="flex-1 items-center">
            <Text
              className={`text-lg font-bold ${
                status.overdue > 0 ? "text-red-200" : "text-white"
              }`}
              style={{ fontFamily: "poppinsBold" }}
            >
              {status.overdue}
            </Text>
            <Text
              className={`text-xs ${
                status.overdue > 0 ? "text-red-200" : "text-white/80"
              }`}
              style={{ fontFamily: "poppins" }}
            >
              Overdue
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          {/* Episodes List */}
          {episodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              episodeType={episode.episode_type}
              startDate={episode.start_date}
              expectedEndDate={episode.expected_end_date}
              milestones={episode.care_plan_milestones || []}
              onPress={() => setSelectedEpisodeId(episode.id)}
            />
          ))}

          {/* Selected Episode Details */}
          {selectedEpisode && (
            <View>
              <View className="flex-row items-center mb-4 mt-6">
                <Ionicons name="list-outline" size={16} color="#ec1e88" />
                <Text
                  className="text-brand-primary text-sm ml-2 font-semibold"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  MILESTONES
                </Text>
              </View>

              <MilestoneTimeline
                milestones={selectedEpisode.care_plan_milestones || []}
                onMilestonePress={handleMilestonePress}
                horizontal={false}
              />

              {/* Quick Actions */}
              <View className="mt-6 flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 rounded-2xl py-3 bg-white items-center justify-center"
                  style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color="#ec1e88"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className="text-sm font-semibold text-brand-primary"
                      style={{ fontFamily: "poppinsSemiBold" }}
                    >
                      Assessment
                    </Text>
                  </View>
                </TouchableOpacity>

                {selectedEpisode.episode_type === "PREGNANCY" && (
                  <TouchableOpacity
                    className="flex-1 rounded-2xl py-3 bg-white items-center justify-center"
                    style={{
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 1,
                    }}
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name="gift-outline"
                        size={16}
                        color="#ec1e88"
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        className="text-sm font-semibold text-brand-primary"
                        style={{ fontFamily: "poppinsSemiBold" }}
                      >
                        Delivery
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
