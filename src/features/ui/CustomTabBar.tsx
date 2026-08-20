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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ICON_SIZE = 20;

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  households: "key-outline",
  mother: "grid-outline",
  tasks: "checkbox-outline",
  profile: "person-outline",
};

const LABELS: Record<string, string> = {
  index: "Home",
  households: "Add House",
  mother: "Mothers",
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
      className="absolute left-6 right-6 flex-row items-center justify-between bg-white/80 rounded-full px-3 py-2"
      style={{
        bottom: Math.max(insets.bottom, 12),
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {state.routes.map((route, index) => {
        const active = index === activeIndex;

        const onPress = () => {
          if (active) return;

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
            className={`flex-row items-center justify-center rounded-full overflow-hidden ${
              active ? "bg-pink-500 px-4 py-2" : "w-11 h-11"
            }`}
          >
            <Ionicons
              name={
                active
                  ? getActiveIcon(getIcon(route.name))
                  : getIcon(route.name)
              }
              size={ICON_SIZE}
              color={active ? "#fff" : "#9ca3af"}
            />

            {active && (
              <Text
                className="ml-1.5 text-white text-sm"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                {LABELS[route.name] ?? route.name}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function getIcon(routeName: string): keyof typeof Ionicons.glyphMap {
  const icon = ICONS[routeName];
  if (!icon && __DEV__) {
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
    "key-outline": "key",
    "trash-outline": "trash",
  };

  return filledIcons[icon] ?? icon;
}