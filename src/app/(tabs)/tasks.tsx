import CurvedTimeline from "@/features/ui/CurvedTimeline";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen(): React.JSX.Element {
  return (
    <LinearGradient
      colors={["#d3f2f3", "#ebe5e3", "#efc8e6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        className="flex-1 items-center justify-center bg-white"
      >
        <Text className="text-xl font-bold text-blue-500">Tasks Screen</Text>

        <View>
          <CurvedTimeline />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
