import "../global.css";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

/**
 * Root Layout
 * Handles conditional routing based on onboarding status
 */
function RootLayoutContent(): React.JSX.Element {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboarding(completed === "true");
      } catch (error) {
        console.error("Error checking onboarding:", error);
        setHasSeenOnboarding(false);
      } finally {
        setOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, []);

  if (!onboardingChecked) {
    return <View style={{ flex: 1 }} />;
  }

  if (!hasSeenOnboarding) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function App(): React.JSX.Element {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../../assets/fonts/poppins.regular.ttf"),
    Poppins_500Medium: require("../../assets/fonts/poppins.medium.ttf"),
    Poppins_600SemiBold: require("../../assets/fonts/poppins.semibold.ttf"),
    Poppins_700Bold: require("../../assets/fonts/poppins.bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}
