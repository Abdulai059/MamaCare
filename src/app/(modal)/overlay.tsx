import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useLockStore } from "@/stores/lockStore";

export default function OverlayScreen() {
  const { isLocked } = useLockStore();

  const handlePress = useCallback(() => {
    if (!isLocked) {
      return;
    }
  }, [isLocked]);

  return (
    <View
      style={[styles.container, !isLocked && styles.hidden]}
      pointerEvents={isLocked ? "auto" : "none"}
    >
      <View style={styles.overlay} onTouchStart={handlePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  hidden: {
    backgroundColor: "transparent",
  },
  overlay: {
    flex: 1,
  },
});