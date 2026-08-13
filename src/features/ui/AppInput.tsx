import { useRef, useState } from "react";
import {
  Animated,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface AppInputProps extends TextInputProps {
  label: string;
  optional?: boolean;
  placeholderClassName?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
}

export function AppInput({
  label,
  optional = false,
  placeholderClassName = "px-4",
  error,
  leftIcon,
  rightIcon,
  clearable = false,
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder,
  editable = true,
  ...inputProps
}: AppInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const currentValue = value !== undefined ? value : internalValue;
  const isValueEmpty = !currentValue || currentValue.length === 0;

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
  };

  const animateBorder = (toValue: number) => {
    Animated.timing(borderAnim, {
      toValue,
      duration: 150,
      useNativeDriver: false, // border/background color can't use native driver
    }).start();
  };

  const borderColor = error
    ? "#f87171" // red-400
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#e5e7eb", "#6366f1"], // gray-200 -> indigo-500
      });

  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-semibold text-gray-700">
        {label}
        {optional ? (
          <Text className="font-normal text-gray-400"> (Optional)</Text>
        ) : null}
      </Text>

      <Animated.View
        style={{ borderColor, borderWidth: 1.5 }}
        className={`flex-row items-center rounded-full bg-white px-1 ${
          !editable ? "opacity-50" : ""
        }`}
      >
        {leftIcon ? <View className="pl-3">{leftIcon}</View> : null}

        <View className="relative flex-1 justify-center">
          <TextInput
            {...inputProps}
            value={value}
            editable={editable}
            onChangeText={handleChangeText}
            onFocus={(e) => {
              setIsFocused(true);
              animateBorder(1);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              animateBorder(0);
              onBlur?.(e);
            }}
            accessibilityLabel={label}
            className={`px-3 py-3 text-base text-gray-800 ${
              inputProps.className ?? ""
            }`}
            placeholderTextColor="transparent"
          />
          {isValueEmpty && placeholder ? (
            <Text
              pointerEvents="none"
              className={`absolute text-base text-gray-400 ${placeholderClassName}`}
            >
              {placeholder}
            </Text>
          ) : null}
        </View>

        {clearable && !isValueEmpty && editable ? (
          <TouchableOpacity
            onPress={() => handleChangeText("")}
            hitSlop={8}
            className="px-2"
          >
            <Text className="text-gray-400">✕</Text>
          </TouchableOpacity>
        ) : null}

        {rightIcon ? <View className="pr-3">{rightIcon}</View> : null}
      </Animated.View>

      {error ? (
        <Text className="mt-1.5 px-1 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}
