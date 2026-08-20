// src/features/components/mothers/MothersList.tsx
import { FlatList, View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotherRow } from "@/features/ui/MotherRow";
import type { PersonAllLocation } from "@/utils/types/person";

interface MothersListProps {
  mothers: PersonAllLocation[];
  isLoading: boolean;
  isError: boolean;
  onSelectMother: (personId: string) => void;
}

export function MothersList({
  mothers,
  isLoading,
  isError,
  onSelectMother,
}: MothersListProps) {
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <ActivityIndicator color="#ec1e88" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <Text className="text-text-muted" style={{ fontFamily: "poppins" }}>
          Couldn't load mothers. Pull to retry.
        </Text>
      </View>
    );
  }

  if (mothers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <View className="w-16 h-16 rounded-full bg-surface-pink items-center justify-center mb-3">
          <Ionicons name="people-outline" size={28} color="#ec1e88" />
        </View>
        <Text
          className="text-text-main text-base mb-1"
          style={{ fontFamily: "poppinsSemiBold" }}
        >
          No mothers yet
        </Text>
        <Text
          className="text-text-muted text-sm text-center px-10"
          style={{ fontFamily: "poppins" }}
        >
          Register households to add mothers
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={mothers}
      keyExtractor={(person) => person.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={10}
      removeClippedSubviews
      renderItem={({ item: person }) => {
        const fullName =
          `${person.first_name ?? ""} ${person.last_name ?? ""}`.trim();

        const age = person.date_of_birth
          ? Math.floor(
              (Date.now() - new Date(person.date_of_birth).getTime()) /
                (1000 * 60 * 60 * 24 * 365),
            )
          : undefined;

        const householdCode = person.household?.household_code ?? "—";

        const careStatus = person.is_pregnant ? "Pregnant" : "Not pregnant";

        return (
          <MotherRow
            name={fullName}
            age={age}
            householdCode={householdCode}
            careStatus={careStatus}
            onPress={() => onSelectMother(person.id)}
          />
        );
      }}
    />
  );
}
