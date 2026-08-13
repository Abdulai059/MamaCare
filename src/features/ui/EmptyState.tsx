
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/shared/constants/colors";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-lg bg-gray-50 px-8 py-12">
      <Ionicons name={icon} size={48} color={Colors.textGray} />

      <Text className="mt-4 text-center text-base text-gray-500">{title}</Text>

      {description ? (
        <Text className="mt-2 text-center text-sm text-gray-400">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
