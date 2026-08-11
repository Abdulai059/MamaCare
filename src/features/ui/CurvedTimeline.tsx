import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const PATH_HEIGHT = 900;

// Milestone / Level Data along the timeline
const STAGES = [
  {
    id: "1",
    title: "START",
    x: width * 0.5,
    y: 780,
    completed: true,
    current: true,
  },
  {
    id: "2",
    title: "Trimester 1",
    x: width * 0.28,
    y: 620,
    completed: false,
    current: false,
  },
  {
    id: "3",
    title: "First Scan",
    x: width * 0.72,
    y: 440,
    completed: false,
    current: false,
  },
  {
    id: "4",
    title: "Trimester 2",
    x: width * 0.32,
    y: 260,
    completed: false,
    current: false,
  },
  {
    id: "5",
    title: "Milestone",
    x: width * 0.5,
    y: 80,
    completed: false,
    current: false,
  },
];

// Smooth S-Curve SVG Path (Bézier curve through the screen width)
const svgPath = `
  M ${width * 0.5} 850
  C ${width * 0.1} 680, ${width * 0.9} 520, ${width * 0.5} 360
  C ${width * 0.1} 200, ${width * 0.9} 100, ${width * 0.5} 20
`;

export default function CurvedTimeline() {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={{ flex: 1 }} className="w-full bg-[#4ECDC4]">
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ height: PATH_HEIGHT, width: width }}
        showsVerticalScrollIndicator={false}
        // Automatically scroll to bottom on layout so "START" is visible immediately
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }}
      >
        <View
          style={{ width: width, height: PATH_HEIGHT, position: "relative" }}
        >
          {/* 1. Curved Path Background (React Native SVG) */}
          <Svg
            height={PATH_HEIGHT}
            width={width}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {/* Thick Outer Border/Track */}
            <Path
              d={svgPath}
              stroke="#2B7A78"
              strokeWidth="24"
              fill="none"
              strokeLinecap="round"
            />
            {/* Dashed Inner Yellow Line */}
            <Path
              d={svgPath}
              stroke="#FFB800"
              strokeWidth="12"
              strokeDasharray="14 10"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          {/* 2. Interactive Nodes Placed Along the Path */}
          {STAGES.map((stage) => {
            const isCurrent = stage.current;

            return (
              <View
                key={stage.id}
                style={{
                  position: "absolute",
                  left: stage.x - (isCurrent ? 70 : 32),
                  top: stage.y - (isCurrent ? 28 : 32),
                  zIndex: 20,
                }}
              >
                {isCurrent ? (
                  /* Main Start Button */
                  <TouchableOpacity
                    activeOpacity={0.9}
                    className="bg-[#3A506B] px-8 py-3.5 rounded-full border-4 border-white/30 shadow-lg items-center justify-center"
                  >
                    <Text className="text-white text-base font-black tracking-widest uppercase">
                      {stage.title}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  /* Circular Level Node */
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className={`w-16 h-16 rounded-full items-center justify-center border-4 border-white shadow-md ${
                      stage.completed ? "bg-[#FFB800]" : "bg-white/80"
                    }`}
                  >
                    <Ionicons
                      name={stage.completed ? "checkmark-sharp" : "lock-closed"}
                      size={22}
                      color={stage.completed ? "#FFFFFF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
