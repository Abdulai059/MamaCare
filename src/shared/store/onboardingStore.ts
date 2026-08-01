import { create } from "zustand";

interface OnboardingState {
  isOnboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isOnboardingCompleted: false,
  setOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),
}));
