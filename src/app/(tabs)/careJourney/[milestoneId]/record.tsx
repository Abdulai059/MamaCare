import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Switch,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import InputField from "@/features/ui/InputField";

export default function RecordMilestoneScreen(): React.JSX.Element {
  const { milestoneId } = useLocalSearchParams<{ milestoneId: string }>();
  const router = useRouter();

  // Form state - will be expanded based on milestone type
  const [bloodPressure, setBloodPressure] = useState("");
  const [weight, setWeight] = useState("");
  const [temperature, setTemperature] = useState("");
  const [hemoglobin, setHemoglobin] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");

  // Danger signs
  const [dangerSigns, setDangerSigns] = useState({
    severeHeadache: false,
    abdominalPain: false,
    vaginalBleeding: false,
    swollenFace: false,
    visualDisturbances: false,
    chestPain: false,
    fevereOver38: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleDangerSignToggle = (key: keyof typeof dangerSigns) => {
    setDangerSigns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    if (!bloodPressure.trim() && !weight.trim()) {
      Alert.alert("Validation", "Please enter at least blood pressure or weight");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Call mutation to save assessment
      // const { mutate } = useCreateAssessment();
      // mutate({
      //   milestone_id: milestoneId,
      //   blood_pressure: bloodPressure,
      //   weight: weight ? parseFloat(weight) : null,
      //   temperature: temperature ? parseFloat(temperature) : null,
      //   symptoms,
      //   notes,
      // });

      Alert.alert("Success", "Assessment recorded successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save assessment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-bg">
      {/* Header */}
      <LinearGradient
        colors={["#ffe2cc", "#c9e8d9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 16,
          paddingBottom: 24,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 self-start"
        >
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-full bg-white/30 items-center justify-center mr-3">
            <Ionicons name="document-text-outline" size={20} color="#000" />
          </View>
          <View>
            <Text
              className="text-2xl text-main font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              Record Assessment
            </Text>
            <Text
              className="text-gray text-sm"
              style={{ fontFamily: "poppins" }}
            >
              Clinical findings and observations
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Vital Signs Section */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="heart-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              VITAL SIGNS
            </Text>
          </View>

          <InputField
            label="Blood Pressure (e.g. 120/80)"
            icon="pulse-outline"
            placeholder="Systolic/Diastolic"
            value={bloodPressure}
            onChangeText={setBloodPressure}
          />

          <InputField
            label="Weight (kg)"
            icon="scale-outline"
            placeholder="e.g. 65.5"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <InputField
            label="Temperature (°C)"
            icon="thermometer-outline"
            placeholder="e.g. 37.0"
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="decimal-pad"
          />

          <InputField
            label="Hemoglobin (g/dL) - Optional"
            icon="water-outline"
            placeholder="e.g. 11.5"
            value={hemoglobin}
            onChangeText={setHemoglobin}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Danger Signs Section */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
            <Text
              className="text-red-600 text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              DANGER SIGNS
            </Text>
          </View>

          {Object.entries(dangerSigns).map(([key, value]) => {
            const labels: Record<string, string> = {
              severeHeadache: "Severe headache",
              abdominalPain: "Abdominal pain",
              vaginalBleeding: "Vaginal bleeding",
              swollenFace: "Swollen face/hands",
              visualDisturbances: "Visual disturbances",
              chestPain: "Chest pain",
              fevereOver38: "Fever (>38°C)",
            };

            return (
              <View
                key={key}
                className="flex-row items-center justify-between rounded-lg px-3 py-3 mb-2 bg-gray-50"
              >
                <Text
                  className="text-sm text-gray-900"
                  style={{ fontFamily: "poppins" }}
                >
                  {labels[key]}
                </Text>
                <Switch
                  value={value}
                  onValueChange={() =>
                    handleDangerSignToggle(key as keyof typeof dangerSigns)
                  }
                  trackColor={{ false: "#e5e7eb", true: "#fca5a5" }}
                  thumbColor={value ? "#dc2626" : "#fff"}
                />
              </View>
            );
          })}
        </View>

        {/* Symptoms Section */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="information-circle-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              SYMPTOMS & NOTES
            </Text>
          </View>

          <Text
            className="text-text-muted text-sm mb-2"
            style={{ fontFamily: "poppinsMedium" }}
          >
            Symptoms
          </Text>
          <TextInput
            className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 text-base"
            style={{ fontFamily: "poppins" }}
            placeholder="Any reported symptoms..."
            placeholderTextColor="#9ca3af"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={3}
          />

          <Text
            className="text-text-muted text-sm mb-2"
            style={{ fontFamily: "poppinsMedium" }}
          >
            Clinical Notes
          </Text>
          <TextInput
            className="bg-gray-50 rounded-2xl px-4 py-3 mb-4 text-base"
            style={{ fontFamily: "poppins" }}
            placeholder="Additional observations and recommendations..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Risk Alert (if danger signs detected) */}
        {Object.values(dangerSigns).some((v) => v) && (
          <View
            className="bg-red-50 rounded-2xl p-4 mb-5 border-l-4"
            style={{ borderLeftColor: "#dc2626" }}
          >
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={20} color="#dc2626" />
              <View className="flex-1 ml-3">
                <Text
                  className="text-red-900 font-semibold text-sm"
                  style={{ fontFamily: "poppinsSemiBold" }}
                >
                  Danger Signs Detected
                </Text>
                <Text
                  className="text-red-700 text-xs mt-1"
                  style={{ fontFamily: "poppins" }}
                >
                  This mother requires immediate referral for further evaluation.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: "#f259ce",
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={isLoading ? ["#f4a8c6", "#f6b8ce"] : ["#f259ce", "#f7638f"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {!isLoading && (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              className="text-white text-base"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              {isLoading ? "Saving..." : "Save Assessment"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
