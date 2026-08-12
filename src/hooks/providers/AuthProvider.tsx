import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  signIn as signInService,
  signOut as signOutService,
} from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  hasSeenOnboarding: boolean;
  isSessionLoading: boolean;
  session: Session | null;
  setHasSeenOnboarding: (val: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const onboarding = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboardingState(onboarding === "true");

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsSessionLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: string, newSession: Session | null) => {
        setSession(newSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const setHasSeenOnboarding = async (val: boolean) => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", val.toString());
      setHasSeenOnboardingState(val);
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInService(email, password);
    // session updates automatically via onAuthStateChange listener
  };

  const signOut = async () => {
    await signOutService();
    // Session updates automatically via onAuthStateChange listener
  };

  return (
    <AuthContext.Provider
      value={{
        hasSeenOnboarding,
        isSessionLoading,
        session,
        setHasSeenOnboarding,
        signIn,
        signOut,
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
