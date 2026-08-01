import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageUtils = {
  async getOnboardingStatus(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem("hasSeenOnboarding");
      return completed === "true";
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      return false;
    }
  },

  async setOnboardingStatus(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", completed.toString());
    } catch (error) {
      console.error("Error setting onboarding status:", error);
    }
  },

  async saveOnboardingStatus(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", completed.toString());
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  },

  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error saving auth token:", error);
    }
  },

  async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error clearing auth token:", error);
    }
  },
};
