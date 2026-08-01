import React from 'react';
import { Stack } from 'expo-router';

/**
 * Auth Layout
 * Stack navigator for authentication flows (onboarding and login)
 * These screens are shown before the user is authenticated
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="onboarding" options={{ title: 'Onboarding' }} />
    </Stack>
  );
}
