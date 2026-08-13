import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/shared/constants/colors";
import { Household } from "@/utils/types/household";
import { useAllPersons } from "@/hooks/query/useAllPersons";

interface HouseholdCardProps {
  household: Household;
  memberCount: number;
  onPress: () => void;
}

export function HouseholdCard({
  household,
  memberCount,
  onPress,
}: HouseholdCardProps) {
  const persons = useAllPersons(household.id);

  // 2. Extract primary person
  const primaryPerson = persons[0];

  const communityName =
    primaryPerson?.community?.name ??
    (household as any)?.community?.name ??
    "No Community";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-3 rounded-xl bg-white p-4"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        elevation: 2,
      }}
    >
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
  );
}
