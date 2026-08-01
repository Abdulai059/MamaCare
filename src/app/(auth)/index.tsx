import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useOnboardingStore } from "../../shared/store/onboardingStore";
import { StorageUtils } from "../../shared/utils/storage";

/**
 * Auth Index Route
 * Entry point for auth group - checks onboarding status and routes accordingly
 * - If onboarding not completed: navigate to onboarding screen
 * - If onboarding completed: navigate to login screen
 */
const AuthIndex: React.FC = () => {
  const router = useRouter();
  const { isOnboardingCompleted, setOnboardingCompleted } =
    useOnboardingStore();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await StorageUtils.getOnboardingStatus();
        setOnboardingCompleted(completed);

        if (completed) {
          router.replace("/(auth)/login");
        } else {
          router.replace("/(auth)/onboarding");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        router.replace("/(auth)/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [router, setOnboardingCompleted]);

  return <View style={{ flex: 1 }} />;
};

export default AuthIndex;
