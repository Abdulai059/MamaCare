// components/GlassPill.tsx
import React from "react";
import { View, ViewProps } from "react-native";

export function GlassPill({ style, children, ...props }: ViewProps) {
  return (
    <View
      {...props}
      style={[
        {
          borderRadius: 999,
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.25)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
