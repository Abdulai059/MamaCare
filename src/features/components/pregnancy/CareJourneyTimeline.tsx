import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimelineStep {
  label: string;
  value: string;
  done: boolean;
}

interface CareJourneyTimelineProps {
  steps: TimelineStep[];
}

export function CareJourneyTimeline({ steps }: CareJourneyTimelineProps) {
  return (
    <View>
      <Text
        className="text-xs uppercase text-gray-400 mb-3"
        style={{ fontFamily: "Poppins_600SemiBold" }}
      >
        Care Journey
      </Text>

      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <View key={step.label} className="flex-row">
            {/* Dot + connecting line */}
            <View className="items-center w-6">
              {step.done ? (
                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              ) : (
                <View className="h-4 w-4 rounded-full border-2 border-gray-200 bg-white" />
              )}
              {!isLast ? (
                <View
                  className={`w-0.5 flex-1 ${
                    step.done ? "bg-green-200" : "bg-gray-100"
                  }`}
                  style={{ minHeight: 24 }}
                />
              ) : null}
            </View>

            {/* Label + value */}
            <View className="flex-1 pb-4 pl-3">
              <Text className="text-sm text-gray-700">{step.label}</Text>
              <Text
                className={`text-xs mt-0.5 ${
                  step.done ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step.value}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
