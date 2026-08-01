import React, { useState } from "react";
import { Text, View, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StorageUtils } from "../../shared/utils/storage";

/**
 * Profile Screen
 * Shows user profile info and logout button
 * Logout clears auth token and returns to login screen
 */
export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          setIsLoading(true);
          try {
            // Clear auth token
            await StorageUtils.clearAuthToken();

            // Navigate back to login
            router.replace("/(auth)/login");
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
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 py-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-gray-800 mb-2">Profile</Text>
          <Text className="text-gray-600 mb-8">Manage your account</Text>

          {/* Profile Info */}
          <View className="bg-gray-50 rounded-lg p-6 mb-8">
            <View className="mb-6">
              <Text className="text-gray-600 text-sm mb-1">Name</Text>
              <Text className="text-gray-800 text-lg font-semibold">
                Demo User
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-gray-600 text-sm mb-1">Role</Text>
              <Text className="text-gray-800 text-lg font-semibold">
                CHPS Worker
              </Text>
            </View>

            <View>
              <Text className="text-gray-600 text-sm mb-1">Facility</Text>
              <Text className="text-gray-800 text-lg font-semibold">
                Lamashegu CHPS
              </Text>
            </View>
          </View>

          {/* Settings Section */}
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Settings
          </Text>

          <TouchableOpacity className="py-3 px-4 border-b border-gray-200 mb-4">
            <Text className="text-gray-800">Language</Text>
            <Text className="text-gray-600 text-sm">English</Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-3 px-4 border-b border-gray-200 mb-8">
            <Text className="text-gray-800">Offline Data</Text>
            <Text className="text-gray-600 text-sm">0 MB</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoading}
            className={`py-3 rounded-lg mb-8 ${
              isLoading ? "bg-gray-400" : "bg-red-500"
            }`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
