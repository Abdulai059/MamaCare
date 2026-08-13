import React from "react";
import { View } from "react-native";
import { AppButton } from "./AppButton";

interface ModalActionsProps {
  cancelLabel?: string;
  submitLabel: string;
  loadingLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ModalActions({
  cancelLabel = "Cancel",
  submitLabel,
  loadingLabel,
  onCancel,
  onSubmit,
  loading = false,
  disabled = false,
}: ModalActionsProps) {
  return (
    <View className="flex-row gap-3">
      <AppButton
        title={cancelLabel}
        variant="secondary"
        onPress={onCancel}
        disabled={disabled}
        className="flex-1"
      />

      <AppButton
        title={loading ? loadingLabel : submitLabel}
        onPress={onSubmit}
        loading={loading}
        disabled={disabled}
        className="flex-1"
      />
    </View>
  );
}
