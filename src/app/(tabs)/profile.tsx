import React, { useState } from "react";
import { Text, View, TouchableOpacity, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/providers/AuthProvider";
import { ScreenScrollView } from "@/shared/context/ScreenScrollView";
import SettingsRow from "@/features/onboarding/components/SettingsRow";

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
    <ScreenScrollView className="bg-surface">
      {/* Gradient header */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 24,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Text
            className="text-2xl text-white"
            style={{ fontFamily: "poppinsBold" }}
          >
            Profile
          </Text>
          <TouchableOpacity onPress={handleLogout} disabled={isLoading}>
            <Text
              className="text-white text-base"
              style={{ fontFamily: "poppinsMedium" }}
            >
              {isLoading ? "..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + identity */}
        <View className="items-center">
          <View className="relative">
            <View
              className="w-24 h-24 rounded-full items-center justify-center overflow-hidden bg-white/20"
              style={{ borderWidth: 3, borderColor: "rgba(255,255,255,0.6)" }}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-24 h-24"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={40} color="#fff" />
              )}
            </View>
            <TouchableOpacity
              className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              <Ionicons name="pencil" size={14} color="#ec1e88" />
            </TouchableOpacity>
          </View>

          <Text
            className="text-lg text-white mt-3"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            {profile?.full_name ?? "—"}
          </Text>
          <Text
            className="text-sm text-white/80 mt-0.5"
            style={{ fontFamily: "poppins" }}
          >
            ID No: {profile?.id?.slice(0, 10) ?? "—"}
          </Text>

          <View className="flex-row items-center bg-white/25 rounded-full px-4 py-1.5 mt-3">
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text
              className="text-white text-xs ml-1.5"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              {profile?.role ?? "CHPS Worker"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Settings */}
      <View className="px-6 -mt-6">
        <View
          className="bg-surface rounded-2xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <SettingsRow
            icon="document-text-outline"
            label="District"
            value={profile?.districts?.name ?? "Not assigned"}
          />
          <SettingsRow
            icon="business-outline"
            label="Facility"
            value={profile?.chps_compounds?.name ?? "Not assigned"}
          />
          <SettingsRow
            icon="mail-outline"
            label="Email"
            value={session?.user?.email ?? "—"}
          />
          <SettingsRow icon="language-outline" label="Languages" />
          <SettingsRow icon="finger-print-outline" label="Face ID" />
          <SettingsRow icon="notifications-outline" label="Notification" />
          <SettingsRow
            icon="cloud-download-outline"
            label="Offline Data"
            value="0 MB"
          />
          <SettingsRow
            icon="information-circle-outline"
            label="Terms & Conditions"
          />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoading}
          className={`mt-6 mb-10 py-4 rounded-2xl ${
            isLoading ? "bg-surface-muted" : "bg-surface-pink"
          }`}
        >
          <Text
            className="text-brand-primary text-center text-base"
            style={{ fontFamily: "poppinsSemiBold" }}
          >
            {isLoading ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenScrollView>
  );
}
