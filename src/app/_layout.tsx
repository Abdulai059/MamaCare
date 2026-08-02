import "../global.css";
import React, { useEffect } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../shared/context/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootNavigator(): React.JSX.Element {
  const { hasSeenOnboarding, isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const authSegment = segments[0];
    const screenSegment = segments[1];

    if (!isAuthenticated) {
      if (!hasSeenOnboarding) {
        if (authSegment !== "(auth)" || screenSegment !== "onboarding") {
          router.replace("/(auth)/onboarding");
        }
      } else {
        if (authSegment !== "(auth)" || screenSegment !== "login") {
          router.replace("/(auth)/login");
        }
      }
    } else {
      if (authSegment !== "(tabs)") {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, hasSeenOnboarding, isLoading, segments, router]);

  if (isLoading) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
