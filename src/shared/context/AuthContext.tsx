import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  setHasSeenOnboarding: (val: boolean) => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
  clearAuthToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [isAuthenticated, setIsAuthenticatedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [onboarding, token] = await Promise.all([
          AsyncStorage.getItem("hasSeenOnboarding"),
          AsyncStorage.getItem("authToken"),
        ]);

        setHasSeenOnboardingState(onboarding === "true");
        setIsAuthenticatedState(!!token);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setHasSeenOnboardingState(false);
        setIsAuthenticatedState(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setHasSeenOnboarding = async (val: boolean) => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", val.toString());
      setHasSeenOnboardingState(val);
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  };

  const setAuthToken = async (token: string) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      setIsAuthenticatedState(true);
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
  };

  const clearAuthToken = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setIsAuthenticatedState(false);
    } catch (error) {
      console.error("Error clearing auth token:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        hasSeenOnboarding,
        isAuthenticated,
        isLoading,
        setHasSeenOnboarding,
        setAuthToken,
        clearAuthToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
