import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingCard } from "../components/OnboardingCard";
import { useAuth } from "@/hooks/providers/AuthProvider";
import { slides } from "@/shared/constants/slides";

const { width } = Dimensions.get("window");

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
  const { setHasSeenOnboarding } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  const handleSkip = async () => {
    try {
      await setHasSeenOnboarding(true);
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    }
  };

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

  const handleGetStarted = async () => {
    try {
      await setHasSeenOnboarding(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: slides[currentIndex].backgroundColorHex,
      }}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        style={{ flex: 1 }}
        removeClippedSubviews={false}
        initialNumToRender={slides.length}
        maxToRenderPerBatch={slides.length}
        windowSize={slides.length}
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
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
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
