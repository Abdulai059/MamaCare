import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/providers/AuthProvider";

interface HeaderSectionProps {
  userName?: string;
  userAvatar?: string;
  appointment?: {
    title: string;
    duration: string;
    doctorName: string;
    doctorRole: string;
    doctorAvatar: string;
    time: string;
  };
  onNotificationPress?: () => void;
  onAppointmentPress?: () => void;
}

export function HeaderSection({ onNotificationPress }: HeaderSectionProps) {
  const { profile, session, signOut } = useAuth();

  return (
    <View className="w-full px-5 pt-4 pb-2">
      {/* 1. Top Bar: User Profile & Notification Bell */}
      <View className="flex-row items-center justify-between mb-6">
        {/* Profile Avatar + Greeting */}
        <View className="flex-row items-center gap-x-3">
          <Image
            source={{ uri: profile?.avatar_url || "" }}
            className="w-12 h-12 rounded-full bg-[#c8c1ef]"
            resizeMode="cover"
          />

          <View>
            <Text className="text-base font-bold text-gray-900 leading-tight">
              Hi {profile?.full_name ?? "—"}
            </Text>
            <Text className="text-xs text-gray-400 font-medium">
              Welcome Back
            </Text>
          </View>
        </View>

        {/* Notification Bell Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNotificationPress}
          className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 items-center justify-center"
        >
          <Ionicons name="notifications-outline" size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* 2. Headline Text */}
      <View className="mb-6">
        <Text className="text-3xl font-normal text-dark leading-9.5">
          All In One <Text className="font-bold">Health</Text>
        </Text>
        <Text className="text-3xl font-bold text-gray-900 leading-9.5">
          Solution
        </Text>
      </View>
    </View>
  );
}
