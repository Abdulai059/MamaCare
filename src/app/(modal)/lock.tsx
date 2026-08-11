import { useEffect, useState } from "react";
import { View, Text, Pressable, Vibration } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLockStore } from "@/stores/lockStore";

const CODE_LENGTH = 4;
const CORRECT_CODE = "1234"; // TODO: replace with real stored/hashed code

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export default function LockScreen() {
  const [code, setCode] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const { setLocked } = useLockStore();

  useEffect(() => {
    if (code.length < CODE_LENGTH) return;

    const entered = code.join("");

    if (entered === CORRECT_CODE) {
      setLocked(false);
      router.back();
      return;
    }

    // Wrong code — flag error, reset after a beat
    setError(true);
    Vibration.vibrate(400);

    const timeout = setTimeout(() => {
      setCode([]);
      setError(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [code]);

  const handleKeyPress = (key: string) => {
    if (key === "" || error) return;

    if (key === "del") {
      setCode((prev) => prev.slice(0, -1));
      return;
    }

    if (code.length >= CODE_LENGTH) return;

    setCode((prev) => [...prev, key]);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-between bg-white px-6 py-12">
      <View className="mt-6 items-center">
        <Text className="mb-1.5 text-xl font-semibold text-neutral-900">
          Welcome back, John
        </Text>
        <Text className="text-sm text-neutral-400">
          Enter your passcode to continue
        </Text>
      </View>

      <View className="flex-row gap-4">
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <View
            key={index}
            className={`h-3.5 w-3.5 rounded-full border-[1.5px] ${
              error
                ? "border-red-500 bg-red-500"
                : index < code.length
                  ? "border-fuchsia-500 bg-fuchsia-500"
                  : "border-neutral-300 bg-transparent"
            }`}
          />
        ))}
      </View>

      <View className="w-full max-w-[320px] flex-row flex-wrap justify-between">
        {KEYS.map((key, index) => {
          if (key === "") {
            return <View key={index} className="mb-4 aspect-square w-[30%]" />;
          }

          const isNumber = key !== "del";
          const isPressed = pressedKey === `${key}-${index}`;

          return (
            <Pressable
              key={index}
              onPress={() => handleKeyPress(key)}
              onPressIn={() => setPressedKey(`${key}-${index}`)}
              onPressOut={() => setPressedKey(null)}
              hitSlop={8}
              className={`mb-4 aspect-square w-[30%] items-center justify-center rounded-full ${
                isNumber
                  ? isPressed
                    ? "bg-neutral-200"
                    : "bg-neutral-100"
                  : ""
              }`}
            >
              {key === "del" ? (
                <Text className="text-[22px] text-neutral-400">⌫</Text>
              ) : (
                <Text className="text-[26px] font-medium text-neutral-900">
                  {key}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
