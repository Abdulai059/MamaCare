import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";

import { createPerson } from "@/services/persons";
import { AppInput } from "@/features/ui/AppInput";
import { ModalHeader } from "@/features/ui/ModalHeader";
import { ModalActions } from "@/features/ui/ModalActions";
import { useDateInput } from "@/hooks/useDateInput";

interface AddPersonModalProps {
  visible: boolean;
  householdId: string;
  onClose: () => void;
}

export function AddPersonModal({
  visible,
  householdId,
  onClose,
}: AddPersonModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dob = useDateInput({ required: false });

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    dob.reset();
  };

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const firstNameValue = firstName.trim();

    if (!firstNameValue) {
      Alert.alert("Error", "Please enter first name");
      return;
    }

    if (dob.value && !dob.validate()) {
      return;
    }

    if (!householdId) {
      return;
    }

    setIsLoading(true);

    try {
      await createPerson({
        household_id: householdId,
        first_name: firstNameValue,
        last_name: lastName.trim() || undefined,
        date_of_birth: dob.getValidValue(),
        phone: phone.trim() || undefined,
      });

      resetForm();
      onClose();

      Alert.alert("Success", "Person added");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to add person";

      Alert.alert("Error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="rounded-t-3xl bg-surface">
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="px-10 pb-8 pt-6">
                <ModalHeader
                  title="Add Mother"
                  description="Add a new mother to this household"
                  onClose={handleClose}
                />

                <AppInput
                  label="First Name"
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                />

                <AppInput
                  label="Last Name"
                  optional
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  editable={!isLoading}
                />

                <AppInput
                  label="Date of Birth"
                  optional
                  placeholder="YYYY-MM-DD"
                  value={dob.value}
                  onChangeText={dob.onChangeText}
                  editable={!isLoading}
                  keyboardType="number-pad"
                  maxLength={10}
                  error={dob.error}
                />

                <AppInput
                  label="Phone"
                  optional
                  placeholder="Phone number"
                  value={phone}
                  onChangeText={setPhone}
                  editable={!isLoading}
                  keyboardType="phone-pad"
                />

                <ModalActions
                  submitLabel="Add Person"
                  loadingLabel="Adding..."
                  onCancel={handleClose}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
