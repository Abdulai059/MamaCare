// src/shared/components/ScreenScrollView.tsx
import React from "react";
import { ScrollView, ScrollViewProps, View, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
  style?: ViewStyle;
}

export function ScreenScrollView({
  children,
  className,
  edges = ["bottom"],
  style,
  ...rest
}: Props) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1 }, style]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        {...rest}
      >
        <View className={className}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
