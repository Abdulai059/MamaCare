import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { OnboardingCard } from "../components/OnboardingCard";
import { useOnboardingStore } from "../../../shared/store/onboardingStore";
import { StorageUtils } from "../../../shared/utils/storage";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  backgroundColor: string;
  accentColor: string; // NEW - solid accent to match the bg tint
  accentColorLight: string; // NEW - for inactive dots
}
/**
 * OnboardingScreen Component
 * Main onboarding flow with swipeable carousel, pagination, and navigation buttons
 *
 * Features:
 * - Horizontal swipe between 4 screens
 * - Pagination indicators (dots)
 * - Skip button (navigates to login)
 * - Next button (moves to next screen)
 * - Get Started button on final screen (saves completion and navigates to login)
 * - Saves onboarding status to AsyncStorage
 */
const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setOnboardingCompleted } = useOnboardingStore();

  const slides: OnboardingSlide[] = [
    {
      id: "1",
      title: "Track Every Moment",
      description:
        "Monitor every step of your pregnancy journey with MamaLink's intelligent care tracking system.",
      image: require("../../../../assets/onboarding/slide1.png"),
      backgroundColor: "bg-pink-50",
      accentColor: "bg-pink-500",
      accentColorLight: "text-pink-500",
    },
    {
      id: "2",
      title: "Detect Early",
      description:
        "Our AI identifies health risks early, helping you and your health worker stay proactive about your care.",
      image: require("../../../../assets/onboarding/slide2.png"),
      backgroundColor: "bg-blue-50",
      accentColor: "bg-blue-500",
      accentColorLight: "text-blue-500",
    },
    {
      id: "3",
      title: "Smart Guidance",
      description:
        "Receive personalized recommendations in your local language, making healthcare guidance easy to understand.",
      image: require("../../../../assets/onboarding/slide3.png"),
      backgroundColor: "bg-green-50",
      accentColor: "bg-green-500",
      accentColorLight: "text-green-500",
    },
    {
      id: "4",
      title: "Join MamaLink",
      description:
        "Be part of a care coordination platform that keeps you and your baby connected to essential healthcare at every stage.",
      image: require("../../../../assets/onboarding/slide4.png"),
      backgroundColor: "bg-purple-50",
      accentColor: "bg-purple-500",
      accentColorLight: "text-purple-500",
    },
  ];
  // Handle scroll end to update current index
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };

  // Skip onboarding and navigate to login
  const handleSkip = async () => {
    try {
      await StorageUtils.saveOnboardingStatus(true);
      setOnboardingCompleted(true);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    }
  };

  // Go to next slide or finish
  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  // Complete onboarding and go to login
  const handleGetStarted = async () => {
    try {
      await StorageUtils.saveOnboardingStatus(true);
      setOnboardingCompleted(true);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView className={`flex-1 ${slides[currentIndex].backgroundColor}`}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => (
          <OnboardingCard
            title={item.title}
            description={item.description}
            image={item.image}
            backgroundColor={item.backgroundColor}
          />
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled
        snapToAlignment="center"
        scrollEventThrottle={16}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      />

      <View className="px-6 py-8">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 transition-all ${
                index === currentIndex
                  ? `${slides[currentIndex].accentColor} w-8`
                  : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </View>

        {/* Buttons Row */}
        <View className="flex-row justify-between items-center">
          {!isLastSlide && (
            <TouchableOpacity onPress={handleSkip}>
              <Text
                className={`${slides[currentIndex].accentColorLight} text-base font-semibold`}
              >
                Skip
              </Text>
            </TouchableOpacity>
          )}

          {!isLastSlide && <View className="flex-1" />}

          <TouchableOpacity
            onPress={handleNext}
            className={`py-3 px-8 rounded-full flex-row items-center justify-center ${
              isLastSlide
                ? "bg-pink-500 flex-1"
                : slides[currentIndex].accentColor
            }`}
          >
            <Text className="text-white text-base font-semibold">
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
            {!isLastSlide && <Text className="text-white text-lg ml-2">→</Text>}
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-500 text-sm mt-4">
          {currentIndex + 1} / {slides.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
