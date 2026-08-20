import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function MothersLoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator color="#ec1e88" />
    </View>
  );
}

export function MothersErrorState() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-text-muted" style={{ fontFamily: "poppins" }}>
        Couldn't load mothers. Pull to retry.
      </Text>
    </View>
  );
}

export function MothersEmptyState() {
  return (
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
  );
}
