import React from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { GlassPill } from "./GlassPill";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // full width minus side padding

// 1. Define Data Model
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  imageUri: string;
  bgColor?: string;
}

// 2. Sample Data Array
const DOCTORS_DATA: Doctor[] = [
  {
    id: "1",
    name: "Dr.Ethan\nBrooks",
    specialty: "Psychiatrist",
    rating: 4.2,
    imageUri:
      "https://i.postimg.cc/RV7zMF4R/Pngtree-portrait-of-young-doctor-with-20392504.png",
    bgColor: "bg-[#FFF2C6]",
  },
  {
    id: "2",
    name: "Dr.Bessie\nCooper",
    specialty: "Therapist",
    rating: 4.8,
    imageUri:
      "https://i.postimg.cc/RV7zMF4R/Pngtree-portrait-of-young-doctor-with-20392504.png",
    bgColor: "bg-[#E6F4FE]",
  },
  {
    id: "3",
    name: "Dr.Sarah\nJenkins",
    specialty: "Pediatrician",
    rating: 4.9,
    imageUri:
      "https://i.postimg.cc/RV7zMF4R/Pngtree-portrait-of-young-doctor-with-20392504.png",
    bgColor: "bg-[#FDE8E8]",
  },
];

// 3. Individual Doctor Card Component
const DoctorCard = ({ item }: { item: Doctor }) => {
  return (
    <View
      style={{ width: CARD_WIDTH }}
      className={`relative h-65 rounded-4xl ${item.bgColor ?? "bg-[#FFF2C6]"} overflow-hidden shadow-md p-5 justify-between mr-4`}
    >
      {/* Top Bar: Rating Badge & Heart Button */}
      <View className="flex-row items-center justify-between z-10">
        <View className="flex-row items-center bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full space-x-1">
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text className="text-xs font-bold text-gray-900">{item.rating}</Text>
        </View>

        <GlassPill className="shadow-sm">
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-10 h-10 rounded-full items-center justify-center"
          >
            <FontAwesome name="heartbeat" size={18} color="#E53935" />
          </TouchableOpacity>
        </GlassPill>
      </View>

      {/* Cutout Image */}
      <Image
        source={{ uri: item.imageUri }}
        style={{
          position: "absolute",
          bottom: -55,
          right: -92,
          width: 360,
          height: 310,
        }}
        resizeMode="contain"
      />

      {/* Info Section */}
      <View className="z-10 mt-2 max-w-[55%]">
        <Text className="text-[11px] font-medium text-gray-700 tracking-wide mb-1">
          {item.specialty}
        </Text>
        <Text className="text-2xl font-black text-gray-900 leading-tight">
          {item.name}
        </Text>
      </View>

      {/* Bottom Bar: Action Pill */}
      <GlassPill style={{ width: 200 }} className="shadow-xs">
        <View
          style={{ flexDirection: "row", alignItems: "center", padding: 3 }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            className="bg-[#1C1E23] px-4 py-[6.5px] rounded-full"
          >
            <Text className="text-white text-xs font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </GlassPill>
    </View>
  );
};

// 4. Main Doctors FlatList Section
export default function DoctorsCarousel() {
  return (
    <View className="py-4">
      <FlatList
        data={DOCTORS_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DoctorCard item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        snapToInterval={CARD_WIDTH + 16} // card width + mr-4 (16px)
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + 16,
          offset: (CARD_WIDTH + 16) * index,
          index,
        })}
      />
    </View>
  );
}
