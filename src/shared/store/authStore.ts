import { create } from "zustand";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userProfile: any;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setUserProfile: (profile: any) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  isAuthenticated: false,
  userProfile: null,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setError: (error) => set({ error }),
}));
