import { AppState, AppStateStatus } from "react-native";

export interface SyncConfig {
  onForeground: () => Promise<void>;
  onBackground?: () => void;
}

class OfflineSyncManager {
  private syncConfigs: Map<string, SyncConfig> = new Map();
  private appStateSubscription: any;
  private appState = AppState.currentState;
  private retryTimeouts: Map<string, any> = new Map();

  setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      console.log("[OfflineSync] App state:", this.appState, "→", nextAppState);

      if (this.appState.match(/inactive|background/) && nextAppState === "active") {
        console.log("[OfflineSync] App in foreground, triggering sync for all managers...");
        this.triggerAllSync();
      }

      if (nextAppState.match(/inactive|background/) && this.appState === "active") {
        console.log("[OfflineSync] App moved to background");
        this.onAllBackground();
      }

      this.appState = nextAppState;
    });

    return this.appStateSubscription;
  }

  register(name: string, config: SyncConfig) {
    this.syncConfigs.set(name, config);
    console.log(`[OfflineSync] Registered: ${name}`);
  }

  private async triggerAllSync() {
    for (const [name, config] of this.syncConfigs) {
      try {
        await config.onForeground();
      } catch (error) {
        console.error(`[OfflineSync] Error syncing ${name}:`, error);
      }
    }
  }

  private onAllBackground() {
    for (const [name, config] of this.syncConfigs) {
      if (config.onBackground) {
        try {
          config.onBackground();
        } catch (error) {
          console.error(`[OfflineSync] Error on background for ${name}:`, error);
        }
      }
    }
  }

  scheduleRetry(name: string, callback: () => Promise<void>, delayMs: number) {
    const existing = this.retryTimeouts.get(name);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      callback().catch((error) => {
        console.error(`[OfflineSync] Retry error for ${name}:`, error);
      });
      this.retryTimeouts.delete(name);
    }, delayMs);

    this.retryTimeouts.set(name, timeout);
  }

  cancelRetry(name: string) {
    const timeout = this.retryTimeouts.get(name);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(name);
    }
  }

  cleanup() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    for (const timeout of this.retryTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.retryTimeouts.clear();
  }
}

export const offlineSyncManager = new OfflineSyncManager();
