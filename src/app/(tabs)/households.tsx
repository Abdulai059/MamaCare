import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { households$, createHousehold, deleteHousehold } from "@/state/households";
import { persons$, createPerson, getPersonsByHousehold } from "@/state/persons";
import { ScreenScrollView } from "@/shared/context/ScreenScrollView";
import { Colors } from "@/shared/constants/colors";

function HouseholdsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<string | null>(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [householdCode, setHouseholdCode] = useState("");
  const [address, setAddress] = useState("");
  const [personFirstName, setPersonFirstName] = useState("");
  const [personLastName, setPersonLastName] = useState("");
  const [personRole, setPersonRole] = useState<"MOTHER" | "CHILD" | "CAREGIVER">(
    "MOTHER",
  );
  const [isLoading, setIsLoading] = useState(false);

  const households = households$?.get() || {};
  const householdsList = Object.values(households as Record<string, any>).filter(
    (h) => !h.deleted_at,
  );

  const handleCreateHousehold = async () => {
    if (!householdCode.trim()) {
      Alert.alert("Error", "Please enter household code");
      return;
    }

    setIsLoading(true);
    try {
      await createHousehold({
        household_code: householdCode.trim(),
        address_description: address || undefined,
      });

      setHouseholdCode("");
      setAddress("");
      setShowCreateModal(false);
      Alert.alert("Success", "Household created");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerson = async () => {
    if (!selectedHousehold) return;
    if (!personFirstName.trim()) {
      Alert.alert("Error", "Please enter first name");
      return;
    }

    setIsLoading(true);
    try {
      await createPerson({
        household_id: selectedHousehold,
        first_name: personFirstName.trim(),
        last_name: personLastName.trim() || undefined,
        role: personRole,
      });

      setPersonFirstName("");
      setPersonLastName("");
      setPersonRole("MOTHER");
      setShowPersonModal(false);
      Alert.alert("Success", "Person added");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHousehold = (id: string) => {
    Alert.alert("Delete Household", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteHousehold(id);
            setSelectedHousehold(null);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const selectedHouseholdData = selectedHousehold
    ? households[selectedHousehold as keyof typeof households]
    : null;
  const householdPersons = selectedHousehold
    ? getPersonsByHousehold(selectedHousehold)
    : [];

  return (
    <ScreenScrollView className="bg-surface">
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-2xl text-gray-800"
            style={{ fontFamily: "Poppins_700Bold" }}
          >
            Households
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-brand-pink rounded-full p-3"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View className="px-6 pb-8">
        {selectedHousehold && selectedHouseholdData ? (
          // Household Detail View
          <View>
            {/* Household Header */}
            <View className="bg-white rounded-2xl p-6 mb-4">
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1">
                  <Text
                    className="text-lg text-gray-800"
                    style={{ fontFamily: "Poppins_700Bold" }}
                  >
                    {selectedHouseholdData.household_code}
                  </Text>
                  {selectedHouseholdData.address_description && (
                    <Text className="text-sm text-gray-500 mt-2">
                      {selectedHouseholdData.address_description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedHousehold(null)}
                  className="p-2"
                >
                  <Ionicons name="chevron-back" size={24} color={Colors.textGray} />
                </TouchableOpacity>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => handleDeleteHousehold(selectedHousehold)}
                className="mt-4 py-3 px-4 bg-red-50 rounded-lg"
              >
                <Text className="text-red-600 text-center font-semibold">
                  Delete Household
                </Text>
              </TouchableOpacity>
            </View>

            {/* Persons in Household */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text
                  className="text-lg text-gray-800"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  Members ({householdPersons.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPersonModal(true)}
                  className="bg-brand-pink rounded-full p-2"
                >
                  <Ionicons name="add" size={18} color="white" />
                </TouchableOpacity>
              </View>

              {householdPersons.length === 0 ? (
                <View className="bg-gray-50 rounded-lg p-4 items-center justify-center py-8">
                  <Ionicons name="people-outline" size={32} color={Colors.textGray} />
                  <Text className="text-gray-500 mt-2">No members added</Text>
                </View>
              ) : (
                <View className="bg-white rounded-xl overflow-hidden">
                  {householdPersons.map((person: any, idx: number) => (
                    <View
                      key={person.id}
                      className={`px-4 py-3 flex-row items-center justify-between ${
                        idx !== householdPersons.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <View className="flex-1">
                        <Text
                          className="text-base text-gray-800"
                          style={{ fontFamily: "Poppins_600SemiBold" }}
                        >
                          {person.first_name} {person.last_name || ""}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {person.role}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={Colors.textGray}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          // Households List View
          <View>
            {householdsList.length === 0 ? (
              <View className="bg-gray-50 rounded-lg p-8 items-center justify-center py-12">
                <Ionicons
                  name="home-outline"
                  size={48}
                  color={Colors.textGray}
                />
                <Text className="text-gray-500 mt-4 text-center text-base">
                  No households yet
                </Text>
                <Text className="text-gray-400 mt-2 text-center text-sm">
                  Tap the + button to create one
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={householdsList}
                keyExtractor={(item) => (item as any).id}
                renderItem={({ item }) => {
                  const h = item as any;
                  const hPersons = getPersonsByHousehold(h.id);
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedHousehold(h.id)}
                      className="bg-white rounded-xl p-4 mb-3"
                      style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <Text
                            className="text-base text-gray-800"
                            style={{ fontFamily: "Poppins_600SemiBold" }}
                          >
                            {h.household_code}
                          </Text>
                          {h.address_description && (
                            <Text className="text-xs text-gray-500 mt-1">
                              {h.address_description}
                            </Text>
                          )}
                          <Text className="text-xs text-gray-400 mt-2">
                            {hPersons.length} member{hPersons.length !== 1 ? "s" : ""}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={Colors.textGray}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>

      {/* Create Household Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="text-2xl text-gray-800"
                style={{ fontFamily: "Poppins_700Bold" }}
              >
                Create Household
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textGray} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="mb-6">
              <Text className="text-sm text-gray-700 font-semibold mb-2">
                Household Code
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="e.g., HH-001"
                value={householdCode}
                onChangeText={setHouseholdCode}
                editable={!isLoading}
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm text-gray-700 font-semibold mb-2">
                Address (Optional)
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="e.g., Near the clinic, Main street"
                value={address}
                onChangeText={setAddress}
                editable={!isLoading}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                disabled={isLoading}
                className="flex-1 py-3 border border-gray-300 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateHousehold}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-lg ${
                  isLoading ? "bg-brand-pink/50" : "bg-brand-pink"
                }`}
              >
                <Text className="text-center text-white font-semibold">
                  {isLoading ? "Creating..." : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Add Person Modal */}
      <Modal
        visible={showPersonModal}
        animationType="slide"
        onRequestClose={() => setShowPersonModal(false)}
      >
        <ScrollView
          className="flex-1 bg-surface"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text
                className="text-2xl text-gray-800"
                style={{ fontFamily: "Poppins_700Bold" }}
              >
                Add Person
              </Text>
              <TouchableOpacity onPress={() => setShowPersonModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textGray} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="mb-6">
              <Text className="text-sm text-gray-700 font-semibold mb-2">
                First Name
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="First name"
                value={personFirstName}
                onChangeText={setPersonFirstName}
                editable={!isLoading}
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm text-gray-700 font-semibold mb-2">
                Last Name (Optional)
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="Last name"
                value={personLastName}
                onChangeText={setPersonLastName}
                editable={!isLoading}
              />
            </View>

            <View className="mb-8">
              <Text className="text-sm text-gray-700 font-semibold mb-2">
                Role
              </Text>
              <View className="flex-row gap-2">
                {(["MOTHER", "CHILD", "CAREGIVER"] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setPersonRole(role)}
                    className={`flex-1 py-3 rounded-lg border-2 ${
                      personRole === role
                        ? "bg-brand-pink border-brand-pink"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-semibold ${
                        personRole === role ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPersonModal(false)}
                disabled={isLoading}
                className="flex-1 py-3 border border-gray-300 rounded-lg"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddPerson}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-lg ${
                  isLoading ? "bg-brand-pink/50" : "bg-brand-pink"
                }`}
              >
                <Text className="text-center text-white font-semibold">
                  {isLoading ? "Adding..." : "Add Person"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </ScreenScrollView>
  );
}

const HouseholdsScreenObserved = observer(HouseholdsScreen);
export default HouseholdsScreenObserved;
