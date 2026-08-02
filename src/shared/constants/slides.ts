export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  backgroundColor: string; // Tailwind class, still used for OnboardingCard
  backgroundColorHex: string; // NEW - real color for SafeAreaView
  accentColor: string;
  accentColorLight: string;
}

export const slides: OnboardingSlide[] = [
  {
    id: "1",
    title: "Track Every Moment",
    description:
      "Monitor every step of your pregnancy journey with MamaLink's intelligent care tracking system.",
    image: require("@/assets/onboarding/slide1.png"),
    backgroundColor: "bg-pink-50",
    backgroundColorHex: "#FDF2F8",
    accentColor: "bg-pink-500",
    accentColorLight: "text-pink-500",
  },
  {
    id: "2",
    title: "Detect Early",
    description:
      "Our AI identifies health risks early, helping you and your health worker stay proactive about your care.",
    image: require("@/assets/onboarding/slide2.png"),
    backgroundColor: "bg-blue-50",
    backgroundColorHex: "#EFF6FF",
    accentColor: "bg-blue-500",
    accentColorLight: "text-blue-500",
  },
  {
    id: "3",
    title: "Smart Guidance",
    description:
      "Receive personalized recommendations in your local language, making healthcare guidance easy to understand.",
    image: require("@/assets/onboarding/slide3.png"),
    backgroundColor: "bg-green-50",
    backgroundColorHex: "#F0FDF4",
    accentColor: "bg-green-500",
    accentColorLight: "text-green-500",
  },
  {
    id: "4",
    title: "Join MamaLink",
    description:
      "Be part of a care coordination platform that keeps you and your baby connected to essential healthcare at every stage.",
    image: require("@/assets/onboarding/slide4.png"),
    backgroundColor: "bg-purple-50",
    backgroundColorHex: "#F5F3FF",
    accentColor: "bg-purple-500",
    accentColorLight: "text-purple-500",
  },
];
