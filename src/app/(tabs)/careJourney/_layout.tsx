import { Stack } from "expo-router";

export default function CareJourneyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[milestoneId]" />
    </Stack>
  );
}
