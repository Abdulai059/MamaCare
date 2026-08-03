import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Option {
  id: string;
  name: string;
}

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: Option | null;
  options: Option[];
  onSelect: (option: Option) => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled,
  icon = "location-outline",
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View className="mb-4">
      <Text
        className="text-sm text-text-muted mb-2 ml-1"
        style={{ fontFamily: "poppinsMedium" }}
      >
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between rounded-full px-4 py-2 ${
          disabled ? "bg-surface-muted" : "bg-white"
        }`}
        style={
          !disabled
            ? {
                borderWidth: 1,
                borderColor: value ? "#f7d9e3" : "#EEF0F3",
                shadowColor: "#000",
                shadowOpacity: 0.02,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }
            : { borderWidth: 1.5, borderColor: "#EEF0F3" }
        }
      >
        <View className="flex-row items-center flex-1">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
              value ? "bg-surface-pink" : "bg-surface-muted"
            }`}
          >
            <Ionicons
              name={icon}
              size={16}
              color={value ? "#ec1e88" : "#9ca3af"}
            />
          </View>
          <Text
            className={value ? "text-text-main" : "text-text-gray"}
            style={{ fontFamily: value ? "poppinsMedium" : "poppins" }}
          >
            {value?.name ?? placeholder}
          </Text>
        </View>
        <Ionicons
          name={disabled ? "lock-closed-outline" : "chevron-down"}
          size={18}
          color="#c4c4c4"
        />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View
            className="bg-white rounded-t-3xl px-5 pt-5"
            style={{ maxHeight: "75%", paddingBottom: 32 }}
          >
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View className="w-10 h-1.5 rounded-full bg-surface-muted" />
            </View>

            <Text
              className="text-lg text-text-main mb-4"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              Select {label}
            </Text>

            {/* Search */}
            <View
              className="flex-row items-center bg-surface-muted rounded-full px-4 mb-4"
              style={{ height: 46 }}
            >
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
                className="flex-1 ml-2 text-text-main"
                style={{ fontFamily: "poppins" }}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = value?.id === item.id;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item);
                      setSearch("");
                      setVisible(false);
                    }}
                    activeOpacity={0.6}
                    className={`flex-row items-center justify-between py-4 px-3 rounded-2xl mb-1 ${
                      isSelected ? "bg-surface-pink" : "bg-white"
                    }`}
                  >
                    <Text
                      className={
                        isSelected ? "text-brand-primary" : "text-text-main"
                      }
                      style={{
                        fontFamily: isSelected ? "poppinsSemiBold" : "poppins",
                      }}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#ec1e88"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="items-center py-10">
                  <Ionicons name="search-outline" size={32} color="#d1d5db" />
                  <Text
                    className="text-text-gray mt-2"
                    style={{ fontFamily: "poppins" }}
                  >
                    No results found
                  </Text>
                </View>
              }
            />

            <TouchableOpacity
              onPress={() => {
                setVisible(false);
                setSearch("");
              }}
              className="items-center justify-center py-3 px-6 rounded-full border border-surface-muted bg-brand-primary"
            >
              <Text
                className="text-center text-white"
                style={{ fontFamily: "poppinsMedium" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
