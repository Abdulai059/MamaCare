import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Home Screen</Text>
    </SafeAreaView>
  );
}
