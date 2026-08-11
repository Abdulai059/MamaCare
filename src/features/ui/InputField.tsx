import { View, Text, TextInput } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function InputField({
  label,
  icon,
  optional,
  ...props
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  optional?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  placeholder?: string;
}) {
  return (
    <View className="mb-4">
      <Text
        className="text-sm text-text-muted mb-2 ml-1"
        style={{ fontFamily: "poppinsMedium" }}
      >
        {label} {optional && <Text className="text-text-gray">(optional)</Text>}
      </Text>
      <View
        className="flex-row items-center bg-white rounded-full px-4"
        style={{
          borderWidth: 1.5,
          borderColor: "#EEF0F3",
          height: 54,
        }}
      >
        <Ionicons name={icon} size={18} color="#9ca3af" />
        <TextInput
          {...props}
          placeholderTextColor="#c4c4c4"
          className="flex-1 ml-3 text-text-main"
          style={{ fontFamily: "poppins" }}
        />
      </View>
    </View>
  );
}
