import React, { useState } from "react";
import { Alert, Modal, ScrollView, View } from "react-native";

import { createHousehold } from "@/services/households";
import { AppInput } from "@/features/ui/AppInput";
import { ModalHeader } from "@/features/ui/ModalHeader";
import { ModalActions } from "@/features/ui/ModalActions";

interface CreateHouseholdModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateHouseholdModal({
  visible,
  onClose,
}: CreateHouseholdModalProps) {
  const [householdCode, setHouseholdCode] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setHouseholdCode("");
    setAddress("");
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const code = householdCode.trim();

    if (!code) {
      Alert.alert("Error", "Please enter household code");
      return;
    }

    setIsLoading(true);

    try {
      await createHousehold({
        household_code: code,
        address_description: address.trim() || undefined,
      });

      resetForm();
      onClose();

      Alert.alert("Success", "Household created");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create household";

      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <ScrollView
        className="flex-1 bg-surface rounded-t-3xl"
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pb-8 pt-8">
          <ModalHeader title="Create Household" onClose={handleClose} />

          <AppInput
            label="Household Code"
            placeholder="e.g., HH-001"
            value={householdCode}
            onChangeText={setHouseholdCode}
            editable={!isLoading}
            autoCapitalize="characters"
          />

          <AppInput
            label="Address"
            optional
            placeholder="e.g., Near the clinic, Main street"
            value={address}
            onChangeText={setAddress}
            editable={!isLoading}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <ModalActions
            submitLabel="Create"
            loadingLabel="Creating..."
            onCancel={handleClose}
            onSubmit={handleSubmit}
            loading={isLoading}
          />
        </View>
      </ScrollView>
    </Modal>
  );
}
