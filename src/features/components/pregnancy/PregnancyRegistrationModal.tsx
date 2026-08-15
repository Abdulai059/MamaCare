import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/shared/constants/colors";
import InputField from "@/features/ui/InputField";
import { createCareEpisode } from "@/services/careEpisodes";

interface PregnancyRegistrationModalProps {
  visible: boolean;
  personId: string;
  onClose: () => void;
  onSubmit: (episodeId: string) => void;
}

export function PregnancyRegistrationModal({
  visible,
  personId,
  onClose,
  onSubmit,
}: PregnancyRegistrationModalProps) {
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setStartDate("");
    setExpectedEndDate("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!startDate) {
      Alert.alert("Error", "Please enter a pregnancy start date");
      return;
    }

    const episodeId = createCareEpisode({
      person_id: personId,
      episode_type: "PREGNANCY",
      start_date: startDate,
      expected_end_date: expectedEndDate || undefined,
    });

    onSubmit(episodeId);
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="rounded-t-3xl bg-gray-100 p-6 overflow-hidden">
            {/* Header */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text
                className="text-base text-gray-800 uppercase"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Pregnancy Registration
              </Text>

              <TouchableOpacity onPress={handleClose} hitSlop={8}>
                <Ionicons name="close" size={24} color={Colors.textGray} />
              </TouchableOpacity>
            </View>

            {/* Fields */}
            <InputField
              label="Pregnancy Start / LMP Date"
              icon="calendar-outline"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />

            <InputField
              label="Expected Delivery Date"
              icon="calendar-outline"
              value={expectedEndDate}
              onChangeText={setExpectedEndDate}
              placeholder="YYYY-MM-DD"
            />

            <InputField
              label="Notes"
              icon="document-text-outline"
              optional
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              className="mt-2 items-center rounded-xl bg-brand-pink py-3.5"
            >
              <Text
                className="text-sm text-white"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                Start Care Journey
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
