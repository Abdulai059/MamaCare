import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";

import { PregnancyRegistrationModal } from "@/features/components/pregnancy/PregnancyRegistrationModal";
import { useCareEpisodes } from "@/hooks/query/useCareEpisodes";

interface PregnancyEpisodeProps {
  personId: string;
}

export const PregnancyEpisode = observer(function PregnancyEpisode({
  personId,
}: PregnancyEpisodeProps) {
  const [showCareModal, setShowCareModal] = useState(false);
  const { activeEpisode } = useCareEpisodes(personId);

  return (
    <View className="rounded-2xl bg-white p-6">
      <Text
        className="text-base text-gray-800 uppercase mb-1"
        style={{ fontFamily: "Poppins_600SemiBold" }}
      >
        Care Status
      </Text>

      {activeEpisode ? (
        <View className="mb-4 gap-y-1.5">
          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-gray-400 w-28">
              STATUS:
            </Text>
            <Text className="text-sm font-semibold text-green-600 flex-1">
              {activeEpisode.status}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-xs font-semibold text-gray-400 w-28">
              START DATE:
            </Text>
            <Text className="text-sm font-medium text-gray-700 flex-1">
              {activeEpisode.start_date}
            </Text>
          </View>

          {activeEpisode.expected_end_date ? (
            <View className="flex-row items-center">
              <Text className="text-xs font-semibold text-gray-400 w-28">
                EXPECTED DUE:
              </Text>
              <Text className="text-sm font-medium text-gray-700 flex-1">
                {activeEpisode.expected_end_date}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <Text className="text-sm text-gray-400 mb-4">
          No active care episode
        </Text>
      )}

      {!activeEpisode ? (
        <TouchableOpacity
          onPress={() => setShowCareModal(true)}
          activeOpacity={0.8}
          className="flex-row items-center justify-center gap-x-2 rounded-xl bg-brand-pink py-3"
        >
          <Ionicons name="add" size={18} color="white" />
          <Text
            className="text-sm text-white"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            Start Pregnancy Care
          </Text>
        </TouchableOpacity>
      ) : null}

      <PregnancyRegistrationModal
        visible={showCareModal}
        personId={personId}
        onClose={() => setShowCareModal(false)}
        onSubmit={() => {
          setShowCareModal(false);
        }}
      />
    </View>
  );
});
