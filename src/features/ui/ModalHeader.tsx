import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/shared/constants/colors";

interface ModalHeaderProps {
  title: string;
  description?: string;
  onClose: () => void;
}

export function ModalHeader({ title, description, onClose }: ModalHeaderProps) {
  return (
    <View className="mb-6 flex-row items-start justify-between">
      {/* Title + Description */}
      <View className="flex-1 pr-4">
        <Text
          className="text-xl text-gray-800"
          style={{ fontFamily: "Poppins_700Bold" }}
        >
          {title}
        </Text>

        {description && (
          <Text
            className="mt-1 text-sm leading-5 text-gray-500"
            style={{ fontFamily: "Poppins_400Regular" }}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Close Button */}
      <TouchableOpacity
        onPress={onClose}
        hitSlop={10}
        className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={24} />
      </TouchableOpacity>
    </View>
  );
}
