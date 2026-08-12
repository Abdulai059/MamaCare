import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { configureSynced } from "@legendapp/state/sync";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

export const customSynced = configureSynced(syncedSupabase, {
  supabase: supabase as any,
  generateId: () => uuidv4(),
  persist: {
    plugin: ObservablePersistAsyncStorage,
    options: {
      asyncStorage: AsyncStorage,
    },
  },
} as any);

// Helper to access storage directly if needed
export const storageAdapter = AsyncStorage;
