import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../shared/context/AuthContext";
import { Colors } from "../../shared/constants/colors";
import loginAvator from "@/assets/onboarding/login.png";

const LoginScreen: React.FC = () => {
  const { setAuthToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const dummyToken = `demo_token_${Date.now()}`;
      await setAuthToken(dummyToken);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfacePink }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-12 justify-center">
            {/* Header */}
            <View className="items-center mb-10">
              <View className="w-21 h-21 rounded-full bg-pink-100 items-center justify-center mb-4">
                <Image
                  source={loginAvator}
                  style={{ width: 100, height: 230 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-3xl font-bold text-gray-800 mb-1">
                MamaLink
              </Text>
              <Text className="text-sm text-gray-500">
                Welcome back, we missed you
              </Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                Email or Phone
              </Text>
              <View className="flex-row items-center border border-gray-200 bg-white rounded-full px-4">
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.textGray}
                />
                <TextInput
                  className="flex-1 text-gray-800"
                  style={{ paddingVertical: 16, paddingHorizontal: 16 }}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textGray}
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2 ml-1">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-200 bg-white rounded-full px-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textGray}
                />
                <TextInput
                  className="flex-1 text-gray-800"
                  style={{ paddingVertical: 16, paddingHorizontal: 16 }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textGray}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.textGray}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity className="mb-8 self-end">
              <Text className="text-pink-500 font-medium">
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`py-4 rounded-full mb-6 ${
                isLoading ? "bg-pink-300" : "bg-pink-500"
              }`}
              style={{
                shadowColor: Colors.brandPink,
                shadowOpacity: 0.3,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}
            >
              <Text className="text-white text-center font-semibold text-base">
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center">
              <Text className="text-gray-500">Don't have an account? </Text>
              <TouchableOpacity>
                <Text className="text-pink-500 font-semibold">Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
