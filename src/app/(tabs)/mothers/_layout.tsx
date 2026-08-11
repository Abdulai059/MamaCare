import { Stack } from "expo-router";

export default function MothersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create/index" />
      <Stack.Screen name="create/household" />
      <Stack.Screen name="create/mother" />
    </Stack>
  );
}
