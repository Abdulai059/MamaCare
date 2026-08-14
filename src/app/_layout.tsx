import "../global.css";
import { useEffect, useState, useRef } from "react";
import { Stack, useSegments, useRouter } from "expo-router";
import {
  StatusBar,
  View,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { setupOnlineManager } from "@/hooks/query/useOnlineManager";
import { useAppState } from "@/hooks/query/useAppState";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/providers/AuthProvider";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import UserInactivityProvider from "@/shared/context/UserInactivity";
import { useLockManager } from "@/hooks/useLockManager";
import { initializeApp } from "@/state/initialization";

SplashScreen.preventAutoHideAsync();
setupOnlineManager();

// Initialize app state, auth, households, and persons in proper order
initializeApp().catch((error) => {
  console.error("[App Init] Initialization error:", error);
});

function SplashOverlay() {
  const { isLoading } = useAuthStatus();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!isLoading && showOverlay) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowOverlay(false);
      });
    }
  }, [isLoading, showOverlay, fadeAnim]);

  if (!showOverlay) {
    return null;
  }

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#ffffff",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          pointerEvents: isLoading ? "auto" : "none",
        },
        { opacity: fadeAnim },
      ]}
    >
      <Image
        source={require("@/assets/onboarding/onboarding.png")}
        style={{ width: 200, height: 200 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading, hasSeenOnboarding } = useAuthStatus();
  const segments = useSegments();
  const router = useRouter();

  useLockManager();

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

      {/* Modal Screens */}
      <Stack.Screen name="(modal)/lock" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modal)/overlay"
        options={{
          headerShown: false,
          animation: "fade",
          animationDuration: 300,
        }}
      />
    </Stack>
  );
}

function RootLayoutContent() {
  const { isLoading } = useAuthStatus();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../../assets/fonts/poppins.regular.ttf"),
    Poppins_500Medium: require("../../assets/fonts/poppins.medium.ttf"),
    Poppins_600SemiBold: require("../../assets/fonts/poppins.semibold.ttf"),
    Poppins_700Bold: require("../../assets/fonts/poppins.bold.ttf"),
  });

  useEffect(() => {
    // Hide native splash when BOTH fonts and auth are loaded
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#f259ce" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RootNavigator />
      <SplashOverlay />
    </View>
  );
}

export default function RootLayout() {
  useAppState();

  useEffect(() => {
    import("@/state/auth").then(({ initializeAuth }) => {
      initializeAuth();
    });
  }, []);

  return (
    <UserInactivityProvider>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </UserInactivityProvider>
  );
}
