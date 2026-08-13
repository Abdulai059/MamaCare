import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

type AppButtonVariant = "primary" | "secondary" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<AppButtonVariant, string> = {
  primary: "bg-brand-pink",
  secondary: "bg-gray-100 border border-gray-300",
  danger: "bg-red-50",
};

const textStyles: Record<AppButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-gray-700",
  danger: "text-red-600",
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center rounded-full py-2.75 px-4 ${
        variantStyles[variant]
      } ${isDisabled && variant === "primary" ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "secondary" : undefined}
        />
      ) : (
        <Text className={`text-center font-semibold ${textStyles[variant]}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
