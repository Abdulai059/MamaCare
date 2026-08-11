import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// --- Mother list row ---
interface RowProps {
  name: string;
  community?: string;
  isPregnant: boolean;
  age?: number;
  onPress: () => void;
}

export default function Row({
  name,
  community,
  isPregnant,
  age,
  onPress,
}: RowProps) {
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
