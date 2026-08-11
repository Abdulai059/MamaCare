// src/state/setup.ts
import "react-native-get-random-values"; // Essential polyfill for secure offline client UUID generation
import { MMKV } from "react-native-mmkv";
import { configureSynced } from "@legendapp/state/sync";
import { syncedQuery } from "@legendapp/state/sync-plugins/tanstack-query";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

// 1. Properly instantiate the MMKV storage instance object
export const localMMKVInstance = new MMKV({ id: "app-local-db" });

// 2. The best way to chain: Pass syncedQuery as the plugin parameter inside configureSynced
export const syncedWithLocalCache = configureSynced(syncedQuery, {
  persist: {
    plugin: ObservablePersistMMKV,
    options: {
      mmkv: localMMKVInstance, // Safely paths your active disk database layer
    },
  },
});
