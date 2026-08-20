import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { ScreenScrollView } from "@/shared/context/ScreenScrollView";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CalEvent = { id: string; date: string; title: string };
type Holiday = { date: string; name: string; source: "ghana" | "global" };

// Fixed-date global observance days — safe to hardcode, don't shift year to year
const GLOBAL_OBSERVANCES: { month: number; day: number; name: string }[] = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 2, day: 4, name: "World Cancer Day" },
  { month: 3, day: 8, name: "International Women's Day" },
  { month: 3, day: 21, name: "World Poetry Day" },
  { month: 4, day: 7, name: "World Health Day" },
  { month: 4, day: 22, name: "Earth Day" },
  { month: 5, day: 1, name: "International Workers' Day" },
  { month: 6, day: 5, name: "World Environment Day" },
  { month: 6, day: 20, name: "World Refugee Day" },
  { month: 7, day: 11, name: "World Population Day" },
  { month: 8, day: 12, name: "International Youth Day" },
  { month: 9, day: 21, name: "International Day of Peace" },
  { month: 10, day: 1, name: "International Day of Older Persons" },
  { month: 10, day: 16, name: "World Food Day" },
  { month: 11, day: 19, name: "International Men's Day" },
  { month: 12, day: 10, name: "Human Rights Day" },
];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastOfMonth.getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

  const cells: { date: Date; inMonth: boolean }[] = [];

  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevMonthLastDate - i),
      inMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    });
  }

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function TasksScreen() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [ghanaHolidays, setGhanaHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // Fetch Ghana public holidays whenever the visible year changes
  useEffect(() => {
    let cancelled = false;
    setLoadingHolidays(true);

    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/GH`)
      .then((res) => res.json())
      .then((data: { date: string; localName: string }[]) => {
        if (cancelled) return;
        setGhanaHolidays(
          data.map((h) => ({
            date: h.date,
            name: h.localName,
            source: "ghana" as const,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setGhanaHolidays([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHolidays(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  const globalHolidays: Holiday[] = useMemo(
    () =>
      GLOBAL_OBSERVANCES.map((o) => ({
        date: toKey(year, o.month - 1, o.day),
        name: o.name,
        source: "global" as const,
      })),
    [year],
  );

  const holidaysByDate = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    [...ghanaHolidays, ...globalHolidays].forEach((h) => {
      const list = map.get(h.date) ?? [];
      list.push(h);
      map.set(h.date, list);
    });
    return map;
  }, [ghanaHolidays, globalHolidays]);

  const eventDateKeys = useMemo(
    () => new Set(events.map((e) => e.date)),
    [events],
  );

  const selectedKey = toKey(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  const eventsForSelected = events.filter((e) => e.date === selectedKey);
  const holidaysForSelected = holidaysByDate.get(selectedKey) ?? [];

  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelectDay = (date: Date, inMonth: boolean) => {
    setSelectedDate(date);
    if (!inMonth) {
      setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: selectedKey,
        title: newEventTitle.trim(),
      },
    ]);
    setNewEventTitle("");
    setModalVisible(false);
  };

  const formattedSelected = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <LinearGradient
      colors={["#dff3ea", "#fbe6f0"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScreenScrollView
        edges={["top", "bottom"]}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-5">
          <TouchableOpacity className="flex-row items-center">
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
            <Text
              className="ml-2 text-base text-gray-900"
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              My Calendar
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color="#374151"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="w-11 h-11 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Ionicons name="add" size={22} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Calendar card */}
        <View
          className="mx-6 bg-white rounded-3xl p-5"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          {/* Month header */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-pink-100 items-center justify-center mr-2">
                <Ionicons name="calendar-outline" size={16} color="#ec4899" />
              </View>
              <Text
                className="text-base text-gray-900"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                {MONTH_NAMES[month]} {year}
              </Text>
              {loadingHolidays && (
                <ActivityIndicator
                  size="small"
                  color="#ec4899"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={goToPrevMonth}
                className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center"
              >
                <Ionicons name="chevron-back" size={16} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToNextMonth}
                className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center"
              >
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Day labels */}
          <View className="flex-row mb-3">
            {DAY_LABELS.map((d) => (
              <Text
                key={d}
                className="flex-1 text-center text-xs text-gray-400"
                style={{ fontFamily: "poppins" }}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Weeks grid */}
          {weeks.map((week, i) => (
            <View key={i} className="flex-row mb-2">
              {week.map(({ date, inMonth }, j) => {
                const key = toKey(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                );
                const selected = isSameDay(date, selectedDate);
                const hasEvent = eventDateKeys.has(key);
                const dayHolidays = holidaysByDate.get(key) ?? [];
                const hasGhanaHoliday = dayHolidays.some(
                  (h) => h.source === "ghana",
                );
                const hasGlobalHoliday = dayHolidays.some(
                  (h) => h.source === "global",
                );
                const isToday = isSameDay(date, today);

                return (
                  <TouchableOpacity
                    key={j}
                    className="flex-1 items-center"
                    activeOpacity={0.7}
                    onPress={() => handleSelectDay(date, inMonth)}
                  >
                    <View
                      className="w-11 h-11 rounded-2xl items-center justify-center"
                      style={{
                        backgroundColor: selected
                          ? "#ec4899"
                          : hasGhanaHoliday
                            ? "#fee2e2"
                            : isToday
                              ? "#fce7f3"
                              : inMonth
                                ? "#f3f4f6"
                                : "#fafafa",
                      }}
                    >
                      <Text
                        className="text-sm"
                        style={{
                          fontFamily:
                            selected || hasGhanaHoliday
                              ? "Poppins_600SemiBold"
                              : "poppins",
                          color: selected
                            ? "#fff"
                            : inMonth
                              ? "#1f2937"
                              : "#d1d5db",
                        }}
                      >
                        {date.getDate()}
                      </Text>

                      <View
                        className="absolute bottom-1 flex-row items-center"
                        style={{ gap: 2 }}
                      >
                        {hasEvent && (
                          <View
                            className="w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: selected ? "#fff" : "#facc15",
                            }}
                          />
                        )}
                        {hasGhanaHoliday && (
                          <View
                            className="w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: selected ? "#fff" : "#ef4444",
                            }}
                          />
                        )}
                        {hasGlobalHoliday && (
                          <View
                            className="w-1 h-1 rounded-full"
                            style={{
                              backgroundColor: selected ? "#fff" : "#3b82f6",
                            }}
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Legend */}
          <View className="flex-row items-center justify-center mt-4 gap-4">
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5" />
              <Text
                className="text-[10px] text-gray-400"
                style={{ fontFamily: "poppins" }}
              >
                Event
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
              <Text
                className="text-[10px] text-gray-400"
                style={{ fontFamily: "poppins" }}
              >
                Ghana holiday
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
              <Text
                className="text-[10px] text-gray-400"
                style={{ fontFamily: "poppins" }}
              >
                Global day
              </Text>
            </View>
          </View>
        </View>

        {/* Selected date */}
        <Text
          className="px-6 mt-6 mb-3 text-lg text-gray-900"
          style={{ fontFamily: "poppinsBold" }}
        >
          {formattedSelected}
        </Text>

        {/* Add new event */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          className="mx-6 bg-white rounded-full py-4 flex-row items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <Ionicons name="add" size={18} color="#374151" />
          <Text
            className="ml-2 text-sm text-gray-800"
            style={{ fontFamily: "Poppins_600SemiBold" }}
          >
            Add new event
          </Text>
        </TouchableOpacity>

        {/* Holidays for selected date */}
        {holidaysForSelected.length > 0 && (
          <View className="mx-6 mt-6">
            {holidaysForSelected.map((h, i) => (
              <View
                key={i}
                className="rounded-2xl p-4 mb-3 flex-row items-center"
                style={{
                  backgroundColor: h.source === "ghana" ? "#fee2e2" : "#dbeafe",
                }}
              >
                <View
                  className="w-2 h-2 rounded-full mr-3"
                  style={{
                    backgroundColor:
                      h.source === "ghana" ? "#ef4444" : "#3b82f6",
                  }}
                />
                <View>
                  <Text
                    className="text-sm text-gray-900"
                    style={{ fontFamily: "Poppins_600SemiBold" }}
                  >
                    {h.name}
                  </Text>
                  <Text
                    className="text-xs text-gray-500 mt-0.5"
                    style={{ fontFamily: "poppins" }}
                  >
                    {h.source === "ghana"
                      ? "Ghana public holiday"
                      : "Global observance day"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Events for selected date */}
        <View className="mx-6 mt-3">
          {eventsForSelected.length > 0 ? (
            eventsForSelected.map((e) => (
              <View
                key={e.id}
                className="bg-white/60 rounded-2xl p-4 mb-3 flex-row items-center"
              >
                <View className="w-2 h-2 rounded-full bg-yellow-400 mr-3" />
                <Text
                  className="text-sm text-gray-900"
                  style={{ fontFamily: "poppins" }}
                >
                  {e.title}
                </Text>
              </View>
            ))
          ) : holidaysForSelected.length === 0 ? (
            <View className="bg-white/60 rounded-2xl p-4">
              <Text
                className="text-xs text-gray-500"
                style={{ fontFamily: "poppins" }}
              >
                No events on this day yet.
              </Text>
            </View>
          ) : null}
        </View>
      </ScreenScrollView>

      {/* Add event modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 items-center justify-center px-6"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="w-full bg-white rounded-3xl p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              className="text-base text-gray-900 mb-1"
              style={{ fontFamily: "Poppins_600SemiBold" }}
            >
              New event
            </Text>
            <Text
              className="text-xs text-gray-400 mb-4"
              style={{ fontFamily: "poppins" }}
            >
              {formattedSelected}
            </Text>

            <TextInput
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              placeholder="Event title"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 mb-5"
              style={{ fontFamily: "poppins" }}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-full py-3 items-center bg-gray-100"
                onPress={() => {
                  setNewEventTitle("");
                  setModalVisible(false);
                }}
              >
                <Text
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-full py-3 items-center bg-pink-500"
                onPress={handleAddEvent}
              >
                <Text
                  className="text-sm text-white"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}
