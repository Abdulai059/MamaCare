import { useEffect } from "react";
import { router } from "expo-router";
import { useLockStore } from "@/stores/lockStore";

export const useLockManager = () => {
  const { isLocked } = useLockStore();

  useEffect(() => {
    if (isLocked) {
      router.push("/(modal)/overlay");
    }
  }, [isLocked]);
};
