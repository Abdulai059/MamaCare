import { observable } from "@legendapp/state";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Region } from "@/utils/types/person";

const STORAGE_KEY = "regions_local";

export const regions$ = observable<Record<string, Region>>({});

regions$.onChange(async () => {
  try {
    const data = regions$.get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("[Regions State] Save error:", error);
  }
});
