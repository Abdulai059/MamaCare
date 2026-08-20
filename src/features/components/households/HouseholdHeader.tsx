import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface HouseholdHeaderProps {
  onAdd: () => void;
}

export function HouseholdHeader({ onAdd }: HouseholdHeaderProps) {
  // const router = useRouter();

  return (
    <LinearGradient
      colors={["#ffe2cc", "#c9e8d9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: 24,
        paddingBottom: 28,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}
    >
      <TouchableOpacity
        // onPress={() => router.back()}
        className="mb-4 self-start"
      >
        <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
          <Ionicons name="arrow-back" size={18} color="#000" />
        </View>
      </TouchableOpacity>
      <View className="flex-row items-center justify-between">
        {/* Title row */}
        <View className="mb-5 flex-row items-center flex-1 pr-3">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/40">
            <Ionicons name="person-add-outline" size={20} color="#3F3F46" />
          </View>

          <View className="flex-1">
            <Text
              className="text-xl text-gray-900"
              style={{ fontFamily: "poppinsBold" }}
            >
              Register Households
            </Text>
            <Text className="mt-0.5 text-sm text-gray-600">
              Manage households and track{"\n"}the care journeys of mothers
            </Text>
          </View>
        </View>

        {/* Add Household */}
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.8}
          className="flex-row items-center rounded-xl bg-rose-300 px-4 py-2"
        >
          <Ionicons name="add" size={18} color="#1F2937" />
          <Text
            className="ml-1.5 text-sm text-gray-900"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// <LinearGradient
//   colors={["#ffe2cc", "#c9e8d9"]}
//   start={{ x: 0, y: 0 }}
//   end={{ x: 1, y: 1 }}
//   style={{
//     paddingTop: 24,
//     paddingBottom: 28,
//     paddingHorizontal: 24,
//     borderBottomLeftRadius: 28,
//     borderBottomRightRadius: 28,
//   }}
// >
//   {/* Back button */}
//   <TouchableOpacity className="mb-4 self-start">
//     <View className="h-9 w-9 items-center justify-center rounded-full bg-white/30">
//       <Ionicons name="arrow-back" size={18} color="#3F3F46" />
//     </View>
//   </TouchableOpacity>

//   {/* Title row */}
//   <View className="mb-5 flex-row items-center">
//     <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-white/40">
//       <Ionicons name="person-add-outline" size={20} color="#3F3F46" />
//     </View>

//     <View className="flex-1">
//       <Text
//         className="text-xl text-gray-900"
//         style={{ fontFamily: "poppinsBold" }}
//       >
//         Register Households & Mothers
//       </Text>
//       <Text
//         className="mt-0.5 text-sm text-gray-600"
//         style={{ fontFamily: "poppins" }}
//       >
//         Manage households and track the care journeys of mothers
//       </Text>
//     </View>
//   </View>

//   {/* Add Household */}
//   <TouchableOpacity
//     onPress={onAdd}
//     activeOpacity={0.8}
//     className="flex-row items-center self-start rounded-xl bg-card-mint px-4 py-2"
//   >
//     <Ionicons name="add" size={18} color="#1F2937" />
//     <Text
//       className="ml-1.5 text-sm text-gray-900"
//       style={{ fontFamily: "Poppins_600SemiBold" }}
//     >
//       Add Household
//     </Text>
//   </TouchableOpacity>
// </LinearGradient>
