import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";

import { PregnancyRegistrationModal } from "@/features/components/pregnancy/PregnancyRegistrationModal";
import { EpisodeDetails } from "./EpisodeDetails";
import { CareJourneyTimeline } from "./CareJourneyTimeline";
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
    <View className="p-4">
      <Text
        className="text-base text-gray-800 uppercase mb-1"
        style={{ fontFamily: "Poppins_600SemiBold" }}
      >
        Care Status
      </Text>

      {activeEpisode ? (
        <>
          <EpisodeDetails episode={activeEpisode} />

          <CareJourneyTimeline
            steps={[
              { label: "Registration", value: "Completed", done: true },
              { label: "Next Appointment", value: "—", done: false },
              { label: "Visits", value: "0 recorded", done: false },
              { label: "Referrals", value: "0 recorded", done: false },
            ]}
          />
        </>
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
        onSubmit={() => setShowCareModal(false)}
      />
    </View>
  );
});