import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { District } from "@/utils/types/person";

const STORAGE_KEY = "districts_local";

export const districts$ = observable<Record<string, District>>({});

districts$.onChange(async () => {
  try {
    const data = districts$.get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[Districts State] Save error:", error);
  }
});
