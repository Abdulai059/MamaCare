import React, { useEffect } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/shared/constants/colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ICON_SIZE = 21; // was 25 — change this one number to resize all icons

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  households: "key-outline",
  mothers: "grid-outline",
  tasks: "checkbox-outline",
  profile: "person-outline",
};

const LABELS: Record<string, string> = {
  index: "Home",
  households: "Add House",
  mothers: "Mothers",
  tasks: "Tasks",
  profile: "Profile",
};

export default function AnimatedTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const activeIndex = state.index;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
  }, [activeIndex]);

  return (
    <View
      className="bg-white px-3.75 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 12) + 10 }}
    >
      <View className="h-10 flex-row items-center justify-between">
        {state.routes.map((route, index) => {
          const active = index === activeIndex;

          const onPress = () => {
            if (active) return;

            // Animate the width change before navigation
            LayoutAnimation.configureNext(
              LayoutAnimation.create(
                250,
                LayoutAnimation.Types.easeInEaseOut,
                LayoutAnimation.Properties.scaleXY,
              ),
            );

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              className={`h-10 rounded-full flex-row items-center justify-center overflow-hidden ${
                active ? "w-27.5 px-4" : "w-13.5 bg-transparent"
              }`}
              style={active ? { backgroundColor: Colors.brandBlue } : undefined}
            >
              <View className="">
                <Ionicons
                  name={
                    active
                      ? getActiveIcon(getIcon(route.name))
                      : getIcon(route.name)
                  }
                  size={ICON_SIZE}
                  color={active ? "#FFFFFF" : "#161616"}
                />
              </View>

              {active && (
                <Text className="ml-2 text-slate-800 text-sm font-semibold">
                  {LABELS[route.name] ?? route.name}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getIcon(routeName: string): keyof typeof Ionicons.glyphMap {
  const icon = ICONS[routeName];
  if (!icon && __DEV__) {
    // If you see this, routeName below is the real key you need to use
    // in ICONS / LABELS — it likely doesn't match what's currently there.
    console.warn(
      `[AnimatedTabBar] No icon mapped for route.name="${routeName}". ` +
        `Current ICONS keys: ${Object.keys(ICONS).join(", ")}`,
    );
  }
  return icon ?? "help-circle-outline";
}

function getActiveIcon(
  icon: keyof typeof Ionicons.glyphMap,
): keyof typeof Ionicons.glyphMap {
  const filledIcons: Partial<
    Record<keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap>
  > = {
    "home-outline": "home",
    "checkbox-outline": "checkbox",
    "person-outline": "person",
    "grid-outline": "grid",
    "trash-outline": "trash",
  };

  return filledIcons[icon] ?? icon;
}
