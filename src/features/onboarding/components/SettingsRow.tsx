import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

export default function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: SettingsRowProps) {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        className="flex-row items-center justify-between px-4 py-4 border-b border-surface-muted"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-9 h-9 rounded-full bg-surface-pink items-center justify-center mr-3">
            <Ionicons name={icon} size={18} color="#ec1e88" />
          </View>
          <Text
            className="text-base text-text-main"
            style={{ fontFamily: "poppinsMedium" }}
          >
            {label}
          </Text>
        </View>

        <View className="flex-row items-center">
          {value && (
            <Text
              className="text-sm text-text-muted mr-2"
              style={{ fontFamily: "poppins" }}
            >
              {value}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color="#c4c4c4" />
        </View>
      </TouchableOpacity>
    </>
  );
}
