// src/shared/components/ScreenScrollView.tsx
import React from "react";
import { ScrollView, ScrollViewProps, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenScrollView({ children, className }: Props) {
  return (
    <SafeAreaView edges={[]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className={className}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
