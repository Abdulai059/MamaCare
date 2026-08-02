import React, { useState } from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@/hooks/providers/AuthProvider";
import { ScreenScrollView } from "@/shared/context/ScreenScrollView";

export default function ProfileScreen(): React.JSX.Element {
  const { profile, session, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => {}, style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          setIsLoading(true);
          try {
            await signOut();
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          } finally {
            setIsLoading(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenScrollView className="px-6 py-8">
      <Text className="text-3xl font-bold text-gray-800 mb-2">Profile</Text>
      <Text className="text-base text-gray-500 mb-8">Manage your account</Text>

      <View className="bg-gray-50 rounded-lg p-6 mb-8">
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">Name</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {profile?.full_name ?? "—"}
          </Text>
        </View>
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">Role</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {profile?.role ?? "—"}
          </Text>
        </View>
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">Email</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {session?.user?.email ?? "—"}
          </Text>
        </View>
        <View className="mb-6">
          <Text className="text-sm text-gray-500 mb-1">District</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {profile?.districts?.name ?? "Not assigned"}
          </Text>
        </View>
        <View className="mb-0">
          <Text className="text-sm text-gray-500 mb-1">Facility</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {profile?.chps_compounds?.name ?? "No Facility Assigned"}
          </Text>
        </View>
      </View>

      <Text className="text-lg font-semibold text-gray-800 mb-4">Settings</Text>

      <TouchableOpacity className="py-3 px-4 border-b border-gray-200 mb-4">
        <Text className="text-base text-gray-800">Language</Text>
        <Text className="text-sm text-gray-500">English</Text>
      </TouchableOpacity>

      <TouchableOpacity className="py-3 px-4 border-b border-gray-200 mb-4">
        <Text className="text-base text-gray-800">Offline Data</Text>
        <Text className="text-sm text-gray-500">0 MB</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoading}
        className={`py-3 rounded-lg mb-8 ${isLoading ? "bg-gray-400" : "bg-red-500"}`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isLoading ? "Logging out..." : "Logout"}
        </Text>
      </TouchableOpacity>
    </ScreenScrollView>
  );
}
