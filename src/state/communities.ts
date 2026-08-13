import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Community } from "@/utils/types/person";

const STORAGE_KEY = "communities_local";

export const communities$ = observable<Record<string, Community>>({});

communities$.onChange(async () => {
  try {
    const data = communities$.get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[Communities State] Save error:", error);
  }
});
