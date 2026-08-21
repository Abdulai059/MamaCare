import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { Colors } from "@/shared/constants/colors";
import { Household } from "@/utils/types/household";
import { useAllPersons } from "@/hooks/query/useAllPersons";
import { LinearGradient } from "expo-linear-gradient";

interface HouseholdCardProps {
  household: Household;
  memberCount: number;
  onPress: () => void;
}

export const HouseholdCard = observer(function HouseholdCard({
  household,
  memberCount,
  onPress,
}: HouseholdCardProps) {
  const persons = useAllPersons(household.id);
  const primaryPerson = persons[0];

  const communityName =
    primaryPerson?.community?.name ??
    (household as any)?.community?.name ??
    "No Community";

  return (
    <LinearGradient
      colors={["#ffe2cc", "#c9e8d9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 12, // matches rounded-xl
        marginBottom: 12, // matches mb-3
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-xs font-semibold text-gray-400 pr-2">
                Comm:
              </Text>
              <Text className="text-sm font-medium text-gray-700">
                {communityName}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-xs font-semibold text-gray-400 pr-2">
                H_Num:
              </Text>
              <Text className="text-sm font-medium text-gray-700">
                {household.household_code}
              </Text>
            </View>

            <Text className="mt-2 text-xs text-gray-400">
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={Colors.textGray} />
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
});
