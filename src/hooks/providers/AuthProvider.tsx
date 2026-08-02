import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Profile = {
  id: string;
  full_name: string;
  role: "CHPS_WORKER" | "SUPERVISOR" | "ADMIN";
  district_id: string | null;
  chps_compound_id: string | null;
  districts: { name: string } | null;
  chps_compounds: { name: string } | null;
};

interface AuthContextType {
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  profile: Profile | null;
  setHasSeenOnboarding: (val: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(
    session &&
    profile &&
    profile.role === "CHPS_WORKER"
  );

  const loadProfile = async (currentSession: Session | null) => {
    if (currentSession) {
      try {
        const p = await getProfile(currentSession.user.id);
        setProfile(p);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const onboarding = await AsyncStorage.getItem("hasSeenOnboarding");
        setHasSeenOnboardingState(onboarding === "true");

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession);
        await loadProfile(currentSession);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: string, newSession: Session | null) => {
        setSession(newSession);
        await loadProfile(newSession);
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // session/profile update automatically via onAuthStateChange listener
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        hasSeenOnboarding,
        isAuthenticated,
        isLoading,
        session,
        profile,
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
