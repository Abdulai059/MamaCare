
// --- Stat card ---
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
}

export default function StatCard({ label, value, icon, colors }: StatCardProps) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 140,
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        justifyContent: "space-between",
        height: 120,
      }}
    >
      <View className="w-9 h-9 rounded-full bg-white/25 items-center justify-center">
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <View>
        <Text
          className="text-white text-2xl"
          style={{ fontFamily: "poppinsBold" }}
        >
          {value}
        </Text>
        <Text
          className="text-white/85 text-xs mt-0.5"
          style={{ fontFamily: "poppinsMedium" }}
        >
          {label}
        </Text>
      </View>
    </LinearGradient>
  );
}


