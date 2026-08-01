import React from "react";
import { View, Text, Image } from "react-native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

interface OnboardingCardProps {
  title: string;
  description: string;
  image: number | string;
  backgroundColor: string;
}

/**
 * OnboardingCard Component
 * Displays a single onboarding slide with image, title, and description
 *
 * Props:
 * - title: Main heading for the slide
 * - description: Supporting text
 * - image: Image source (require() or URI)
 * - backgroundColor: Background color for the slide
 */
export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  image,
  backgroundColor,
}) => {
  return (
    <View
      style={{ width }}
      className={`flex-1 justify-center items-center ${backgroundColor} px-6`}
    >
      {/* Image Container */}
      <View className="mb-8">
        {typeof image === "string" ? (
          <Image
            source={{ uri: image }}
            className="w-64 h-80"
            resizeMode="contain"
          />
        ) : (
          <Image source={image} className="w-64 h-80" resizeMode="contain" />
        )}
      </View>

      {/* Content Container */}
      <View className="items-center mb-12">
        {/* Title */}
        <Text className="text-4xl font-bold text-gray-800 text-center mb-4">
          {title}
        </Text>

        {/* Description */}
        <Text className="text-base text-gray-600 text-center leading-relaxed">
          {description}
        </Text>
      </View>
    </View>
  );
};
