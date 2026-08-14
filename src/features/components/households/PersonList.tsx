
import { Text, View, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";

import { Colors } from "@/shared/constants/colors";
import { EmptyState } from "@/features/ui/EmptyState";
import type { PersonAllLocation } from "@/utils/types/person";

interface PersonListProps {
  persons: PersonAllLocation[];
  onPressPerson?: (person: PersonAllLocation) => void;
}

export const PersonList = observer(function PersonList({
  persons,
  onPressPerson,
}: PersonListProps) {
  if (!persons || persons.length === 0) {
    return <EmptyState icon="people-outline" title="No members added" />;
  }

  return (
    <View className="overflow-hidden rounded-xl bg-white shadow-sm">
      {persons.map((person) => {
        return (
          <Pressable
            key={person.id}
            onPress={() => onPressPerson?.(person)}
            className="p-4 active:bg-gray-50 flex-col"
          >
            {/* Header: Person Name & Navigation Chevron */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-xs font-semibold text-gray-400 w-24">
                  MORTHER:
                </Text>
                <Text
                  className="text-base text-gray-900 uppercase"
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                  }}
                >
                  <Text>{person.first_name}</Text>
                  {"   "}
                  <Text>{person.last_name}</Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => onPressPerson?.(person)}
                hitSlop={8}
                className="flex-row items-center gap-x-1 bg-[#f157cd] rounded-md px-2 py-2"
              >
                <Text
                  className="text-xs text-white"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  View Details
                </Text>
                {/* <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.brandPink}
                /> */}
              </TouchableOpacity>
            </View>

            {/* Column Location & Contact Details */}
            <View className="flex-col gap-y-1.5 pl-0">
              {/* Region */}
              <View className="flex-row items-center">
                <Text className="text-xs font-semibold text-gray-400 w-24">
                  REGION:
                </Text>
                <Text className="text-sm font-medium text-gray-700 flex-1">
                  {person.region?.name || "N/A"}
                </Text>
              </View>

              {/* District */}
              <View className="flex-row items-center">
                <Text className="text-xs font-semibold text-gray-400 w-24">
                  DISTRICT:
                </Text>
                <Text className="text-sm font-medium text-gray-700 flex-1">
                  {person.district?.name || "N/A"}
                </Text>
              </View>

              {/* Community */}
              <View className="flex-row items-center">
                <Text className="text-xs font-semibold text-gray-400 w-24">
                  COMMUNITY:
                </Text>
                <Text className="text-sm font-medium text-gray-700 flex-1">
                  {person.community?.name || "N/A"}
                </Text>
              </View>

              {/* House Code */}
              <View className="flex-row items-center">
                <Text className="text-xs font-semibold text-gray-400 w-24">
                  HOUSE CODE:
                </Text>
                <Text className="text-sm font-semibold text-brand-pink flex-1">
                  {person.household?.household_code || "N/A"}
                </Text>
              </View>

              {/* Phone */}
              {person.phone ? (
                <View className="flex-row items-center mt-0.5">
                  <Text className="text-xs font-semibold text-gray-400 w-24">
                    PHONE:
                  </Text>
                  <Text className="text-sm font-medium text-gray-600 flex-1">
                    {person.phone}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
});
