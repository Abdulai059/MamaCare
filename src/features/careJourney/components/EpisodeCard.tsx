import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Milestone {
  id: string;
  title: string;
  due_date: string;
  completed_date?: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE" | "DUE";
}

interface EpisodeCardProps {
  episodeType: "PREGNANCY" | "MOTHER_POSTNATAL" | "NEWBORN";
  startDate: string;
  expectedEndDate?: string;
  milestones: Milestone[];
  onPress: () => void;
}

export function EpisodeCard({
  episodeType,
  startDate,
  expectedEndDate,
  milestones,
  onPress,
}: EpisodeCardProps) {
  const completedCount = milestones.filter(
    (m) => m.status === "COMPLETED"
  ).length;
  const totalCount = milestones.length;
  const progress = (completedCount / totalCount) * 100;

  // Get episode icon and color
  const getEpisodeStyle = () => {
    switch (episodeType) {
      case "PREGNANCY":
        return {
          gradient: ["#ffe2cc", "#c9e8d9"],
          icon: "heart-outline",
          label: "Pregnancy",
          color: "#ec1e88",
        };
      case "MOTHER_POSTNATAL":
        return {
          gradient: ["#fdd7e4", "#e3d4f4"],
          icon: "woman-outline",
          label: "Postnatal",
          color: "#a855f7",
        };
      case "NEWBORN":
        return {
          gradient: ["#dbeafe", "#e0e7ff"],
          icon: "heart-outline",
          label: "Newborn",
          color: "#3b82f6",
        };
      default:
        return {
          gradient: ["#f3f4f6", "#e5e7eb"],
          icon: "document-outline",
          label: "Episode",
          color: "#6b7280",
        };
    }
  };

  const style = getEpisodeStyle();

  // Find next incomplete milestone
  const nextMilestone = milestones.find(
    (m) => m.status === "PENDING" || m.status === "DUE" || m.status === "OVERDUE"
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-4"
    >
      <LinearGradient
        colors={style.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
            >
              <Ionicons name={style.icon as any} size={18} color={style.color} />
            </View>
            <View>
              <Text
                className="text-base font-semibold text-gray-900"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                {style.label}
              </Text>
              <Text
                className="text-xs text-gray-600"
                style={{ fontFamily: "poppins" }}
              >
                {completedCount}/{totalCount} milestones
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>

        {/* Progress Bar */}
        <View className="bg-white/30 rounded-full h-2 mb-3 overflow-hidden">
          <View
            className="bg-white h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

        {/* Next Milestone */}
        {nextMilestone && (
          <View className="bg-white/50 rounded-lg p-2">
            <Text
              className="text-xs text-gray-600 mb-1"
              style={{ fontFamily: "poppins" }}
            >
              Next:
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-sm font-semibold text-gray-900 flex-1"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                {nextMilestone.title}
              </Text>
              <Text
                className={`text-xs font-semibold ${
                  nextMilestone.status === "OVERDUE"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
                style={{ fontFamily: "poppinsMedium" }}
              >
                {nextMilestone.status === "OVERDUE"
                  ? "Overdue"
                  : `Due ${formatDate(nextMilestone.due_date)}`}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
