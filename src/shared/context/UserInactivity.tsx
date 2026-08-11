import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useLockStore } from "@/stores/lockStore";

type Props = {
  children: React.ReactNode;
};

const LOCK_TIME = 3000; // ms

const UserInactivityProvider = ({ children }: Props) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  const { setLocked } = useLockStore();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [setLocked]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log("AppState", appState.current, "->", nextAppState);

    if (nextAppState === "background") {
      backgroundTime.current = Date.now();
    } else if (nextAppState === "active" && appState.current === "background") {
      const startTime = backgroundTime.current;

      if (startTime && Date.now() - startTime > LOCK_TIME) {
        console.log("Locking app - background time exceeded");
        setLocked(true);
        router.push("/(modal)/lock");
      }

      backgroundTime.current = null;
    }

    appState.current = nextAppState;
  };

  return <>{children}</>;
};

export default UserInactivityProvider;
