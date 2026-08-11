import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
// import { useCreateHousehold } from "@/hooks/mutations/useCreateHousehold";
// import { useRegisterMother } from "@/hooks/mutations/useRegisterMother";
// import {
//   useCommunities,
//   useCompoundsByCommunity,
// } from "@/hooks/query/useCommunities";
import { SelectField } from "@/features/onboarding/components/SelectField";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import InputField from "@/features/ui/InputField";

interface Option {
  id: string;
  name: string;
}

export default function CreateHouseholdAndMotherScreen() {
  const router = useRouter();

  // Household State
  const [community, setCommunity] = useState<Option | null>(null);
  const [compound, setCompound] = useState<Option | null>(null);
  const [householdCode, setHouseholdCode] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [gpsLocation, setGpsLocation] = useState("");

  // Mother State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [lmpDate, setLmpDate] = useState<Date | null>(null);
  const [eddDate, setEddDate] = useState<Date | null>(null);
  const [showLmpPicker, setShowLmpPicker] = useState(false);
  const [showEddPicker, setShowEddPicker] = useState(false);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const { data: communities = [] } = useCommunities();
  // const { data: compounds = [] } = useCompoundsByCommunity(community?.id ?? "");
  // const { mutate: createHousehold } = useCreateHousehold();
  // const { mutate: registerMother } = useRegisterMother("");
  const communities = [];
  const compounds = [];
  const createHousehold = () => {};
  const registerMother = () => {};

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleDateOfBirthChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const handleLmpChange = (_event: any, selectedDate?: Date) => {
    setShowLmpPicker(Platform.OS === "ios");
    if (selectedDate) {
      setLmpDate(selectedDate);
      const edd = new Date(selectedDate);
      edd.setDate(edd.getDate() + 280);
      setEddDate(edd);
    }
  };

  const handleEddChange = (_event: any, selectedDate?: Date) => {
    setShowEddPicker(Platform.OS === "ios");
    if (selectedDate) {
      setEddDate(selectedDate);
    }
  };

  const validateForm = () => {
    // Household validation
    if (!community) {
      Alert.alert("Missing info", "Please select a community");
      return false;
    }
    if (!compound) {
      Alert.alert("Missing info", "Please select a CHPS compound");
      return false;
    }

    // Mother validation
    if (!firstName.trim()) {
      Alert.alert("Missing info", "First name is required");
      return false;
    }

    if (isPregnant && (!lmpDate || !eddDate)) {
      Alert.alert(
        "Missing info",
        "Please enter LMP and EDD dates for pregnancy",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Connection Timeout",
        "The request took too long. Please check your connection and try again.",
      );
    }, 30000); // 30 second timeout

    try {
      // Create household (let backend generate ID)
      createHousehold(
        {
          community_id: community!.id,
          chps_compound_id: compound!.id,
          household_code: householdCode || undefined,
          house_number: houseNumber || undefined,
          gps_location: gpsLocation || undefined,
        },
        {
          onSuccess: (household: any) => {
            clearTimeout(timeoutId);

            // Register mother to the created household
            const motherTimeoutId = setTimeout(() => {
              setIsSubmitting(false);
              Alert.alert(
                "Connection Timeout",
                "Mother registration took too long. Please check your connection and try again.",
              );
            }, 30000);

            registerMother(
              {
                household_id: household.id,
                first_name: firstName,
                last_name: lastName || undefined,
                phone: phone || undefined,
                preferred_language: preferredLanguage || undefined,
                date_of_birth: dateOfBirth
                  ? dateOfBirth.toISOString().split("T")[0]
                  : undefined,
                is_pregnant: isPregnant ? 1 : 0,
                lmp_date: lmpDate
                  ? lmpDate.toISOString().split("T")[0]
                  : undefined,
                edd_date: eddDate
                  ? eddDate.toISOString().split("T")[0]
                  : undefined,
              },
              {
                onSuccess: () => {
                  clearTimeout(motherTimeoutId);
                  setIsSubmitting(false);
                  Alert.alert(
                    "Success",
                    "Household and mother registered successfully!",
                  );
                  router.replace("/mothers");
                },
                onError: (error: any) => {
                  clearTimeout(motherTimeoutId);
                  setIsSubmitting(false);
                  Alert.alert(
                    "Error registering mother",
                    error.message || "Unknown error",
                  );
                },
              },
            );
          },
          onError: (error: any) => {
            clearTimeout(timeoutId);
            setIsSubmitting(false);
            Alert.alert(
              "Error creating household",
              error.message || "Unknown error",
            );
          },
        },
      );
    } catch (error: any) {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  const isValid = !!community && !!compound && !!firstName.trim();

  return (
    <View className="flex-1 bg-surface-bg">
      {/* Header */}
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
          onPress={() => router.back()}
          className="mb-4 self-start"
        >
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center mb-2">
          <View className="w-11 h-11 rounded-full bg-white/30 items-center justify-center mr-3">
            <Ionicons name="person-add-outline" size={20} color="#000" />
          </View>
          <View>
            <Text
              className="text-2xl text-main font-bold"
              style={{ fontFamily: "poppinsBold" }}
            >
              Register Mother
            </Text>
            <Text
              className="text-gray text-sm"
              style={{ fontFamily: "poppins" }}
            >
              Household & Mother in one form
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Location */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="map-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              LOCATION
            </Text>
          </View>

          <SelectField
            label="Community"
            placeholder="Select a community"
            value={community}
            options={communities}
            icon="business-outline"
            onSelect={(option) => {
              setCommunity(option);
              setCompound(null);
            }}
          />

          <SelectField
            label="CHPS Compound"
            placeholder={
              community ? "Select a compound" : "Select a community first"
            }
            value={compound}
            options={compounds}
            icon="medkit-outline"
            onSelect={setCompound}
            disabled={!community}
          />
        </View>

        {/* SECTION 2: Household Details */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="home-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              HOUSEHOLD DETAILS
            </Text>
          </View>

          <InputField
            label="Household Code"
            icon="barcode-outline"
            placeholder="e.g., HH-001"
            value={householdCode}
            onChangeText={setHouseholdCode}
          />
          <InputField
            label="House Number"
            icon="pin-outline"
            placeholder="e.g., Plot 12"
            value={houseNumber}
            onChangeText={setHouseNumber}
          />
          <InputField
            label="GPS Location"
            icon="navigate-outline"
            placeholder="e.g., 5.6037,-0.1870"
            value={gpsLocation}
            onChangeText={setGpsLocation}
          />
        </View>

        {/* SECTION 3: Mother Details */}
        <View
          className="bg-white rounded-3xl p-5 mb-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="person-outline" size={16} color="#ec1e88" />
            <Text
              className="text-brand-primary text-sm ml-2"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              MOTHER INFORMATION
            </Text>
          </View>

          <InputField
            label="First Name *"
            icon="person-outline"
            placeholder="Enter first name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <InputField
            label="Last Name"
            icon="person-outline"
            placeholder="Enter last name"
            value={lastName}
            onChangeText={setLastName}
          />
          <InputField
            label="Phone Number"
            icon="call-outline"
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <InputField
            label="Preferred Language"
            icon="language-outline"
            placeholder="e.g., English, Twi, Ga"
            value={preferredLanguage}
            onChangeText={setPreferredLanguage}
          />

          {/* Date of Birth */}
          <Text
            className="text-text-muted text-sm mb-2"
            style={{ fontFamily: "poppinsMedium" }}
          >
            Date of Birth
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
            style={{ backgroundColor: "#f2f4f7" }}
          >
            <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
            <Text
              className="ml-3 text-base"
              style={{
                fontFamily: "poppins",
                color: dateOfBirth ? "#1a1a1a" : "#9ca3af",
              }}
            >
              {dateOfBirth ? formatDate(dateOfBirth) : "Select date of birth"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(1995, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleDateOfBirthChange}
            />
          )}

          {/* Pregnancy Toggle */}
          <View
            className="flex-row items-center justify-between rounded-2xl px-4 py-3 mt-1"
            style={{ backgroundColor: "#f2f4f7" }}
          >
            <View className="flex-row items-center">
              <Ionicons name="heart-outline" size={18} color="#9ca3af" />
              <Text
                className="ml-3 text-base text-text-main"
                style={{ fontFamily: "poppinsMedium" }}
              >
                Currently Pregnant
              </Text>
            </View>
            <Switch
              value={isPregnant}
              onValueChange={setIsPregnant}
              trackColor={{ false: "#e5e7eb", true: "#f7638f" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* SECTION 4: Pregnancy Details (Conditional) */}
        {isPregnant && (
          <View
            className="bg-white rounded-3xl p-5 mb-5"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="calendar-outline" size={16} color="#ec1e88" />
              <Text
                className="text-brand-primary text-sm ml-2"
                style={{ fontFamily: "poppinsSemiBold" }}
              >
                PREGNANCY DATES
              </Text>
            </View>

            {/* LMP */}
            <Text
              className="text-text-muted text-sm mb-2"
              style={{ fontFamily: "poppinsMedium" }}
            >
              Last Menstrual Period (LMP) *
            </Text>
            <TouchableOpacity
              onPress={() => setShowLmpPicker(true)}
              className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
              style={{ backgroundColor: "#f2f4f7" }}
            >
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              <Text
                className="ml-3 text-base"
                style={{
                  fontFamily: "poppins",
                  color: lmpDate ? "#1a1a1a" : "#9ca3af",
                }}
              >
                {lmpDate ? formatDate(lmpDate) : "Select LMP date"}
              </Text>
            </TouchableOpacity>

            {showLmpPicker && (
              <DateTimePicker
                value={lmpDate || new Date(2024, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={handleLmpChange}
              />
            )}

            {/* EDD */}
            <Text
              className="text-text-muted text-sm mb-2"
              style={{ fontFamily: "poppinsMedium" }}
            >
              Estimated Delivery Date (EDD)
            </Text>
            <TouchableOpacity
              onPress={() => setShowEddPicker(true)}
              className="flex-row items-center rounded-2xl px-4 py-3 mb-4"
              style={{ backgroundColor: "#f2f4f7" }}
            >
              <Ionicons name="calendar-outline" size={18} color="#9ca3af" />
              <Text
                className="ml-3 text-base"
                style={{
                  fontFamily: "poppins",
                  color: eddDate ? "#1a1a1a" : "#9ca3af",
                }}
              >
                {eddDate ? formatDate(eddDate) : "Auto-calculated from LMP"}
              </Text>
            </TouchableOpacity>

            {showEddPicker && (
              <DateTimePicker
                value={eddDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={handleEddChange}
              />
            )}

            <Text
              className="text-xs text-gray-400 mt-2"
              style={{ fontFamily: "poppins" }}
            >
              EDD is auto-calculated as 280 days from LMP
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || !isValid}
          activeOpacity={0.85}
          className="rounded-full overflow-hidden"
          style={{
            shadowColor: "#f259ce",
            shadowOpacity: isValid ? 0.35 : 0,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: isValid ? 4 : 0,
          }}
        >
          <LinearGradient
            colors={
              isSubmitting ? ["#f4a8c6", "#f6b8ce"] : ["#f259ce", "#f7638f"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 18,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text
              className="text-white text-base"
              style={{ fontFamily: "poppinsSemiBold" }}
            >
              {isSubmitting ? "Registering..." : "Register Mother & Household"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
