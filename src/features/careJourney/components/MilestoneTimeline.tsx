import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Milestone {
  id: string;
  title: string;
  due_date: string;
  completed_date?: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE" | "DUE";
  milestone_sequence: number;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestonePress: (milestoneId: string) => void;
  horizontal?: boolean;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return { icon: "checkmark-circle", color: "#22c55e", label: "✓" };
    case "OVERDUE":
      return { icon: "alert-circle", color: "#dc2626", label: "⚠" };
    case "DUE":
      return { icon: "alert-circle-outline", color: "#f59e0b", label: "🟠" };
    default:
      return { icon: "ellipse-outline", color: "#d1d5db", label: "○" };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MilestoneTimeline({
  milestones,
  onMilestonePress,
  horizontal = false,
}: MilestoneTimelineProps) {
  if (horizontal) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        className="bg-white rounded-2xl"
      >
        {milestones.map((milestone, index) => {
          const status = getStatusIcon(milestone.status);
          return (
            <View key={milestone.id} className="items-center mr-4">
              <TouchableOpacity
                onPress={() => onMilestonePress(milestone.id)}
                className="items-center"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: status.color + "20" }}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={24}
                    color={status.color}
                  />
                </View>
                <Text
                  className="text-xs text-center text-gray-900 max-w-[80px]"
                  style={{ fontFamily: "poppinsMedium" }}
                  numberOfLines={2}
                >
                  {milestone.title}
                </Text>
                <Text
                  className="text-xs text-gray-400 mt-1"
                  style={{ fontFamily: "poppins" }}
                >
                  {formatDate(milestone.due_date)}
                </Text>
              </TouchableOpacity>
              {index < milestones.length - 1 && (
                <View
                  className="h-1 w-6 absolute left-12"
                  style={{ backgroundColor: "#e5e7eb" }}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  // Vertical timeline
  return (
    <View
      className="bg-white rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
    >
      {milestones.map((milestone, index) => {
        const status = getStatusIcon(milestone.status);
        const isLast = index === milestones.length - 1;

        return (
          <TouchableOpacity
            key={milestone.id}
            onPress={() => onMilestonePress(milestone.id)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              {/* Timeline line and dot */}
              <View className="items-center mr-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: status.color + "20" }}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={20}
                    color={status.color}
                  />
                </View>
                {!isLast && (
                  <View
                    className="w-1 flex-1 mt-2"
                    style={{
                      backgroundColor: "#e5e7eb",
                      minHeight: 40,
                    }}
                  />
                )}
              </View>

              {/* Milestone content */}
              <View className="flex-1 pt-1 pb-4">
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-sm font-semibold text-gray-900 flex-1"
                    style={{ fontFamily: "poppinsSemiBold" }}
                  >
                    {milestone.title}
                  </Text>
                  <Text
                    className={`text-xs font-semibold ml-2 ${
                      status.color === "#22c55e"
                        ? "text-green-600"
                        : status.color === "#dc2626"
                        ? "text-red-600"
                        : status.color === "#f59e0b"
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                    style={{ fontFamily: "poppinsMedium" }}
                  >
                    {milestone.status === "COMPLETED"
                      ? "Completed"
                      : milestone.status === "OVERDUE"
                      ? "Overdue"
                      : milestone.status === "DUE"
                      ? "Due Today"
                      : "Pending"}
                  </Text>
                </View>
                <Text
                  className="text-xs text-gray-500 mt-1"
                  style={{ fontFamily: "poppins" }}
                >
                  Due: {formatDate(milestone.due_date)}
                  {milestone.completed_date &&
                    ` • Completed: ${formatDate(milestone.completed_date)}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
