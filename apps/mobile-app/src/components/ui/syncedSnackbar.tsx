import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";

type SyncedSnackbarProps = {
  visible: boolean;
  message: string;
  synced: boolean;
  syncedCount: number;
  description?: string;
  onClose?: () => void;
};

export default function SyncedSnackbar({
  visible,
  message,
  synced,
  syncedCount,
  description,
  onClose,
}: SyncedSnackbarProps) {
  if (!visible || !synced) return null;

  const effectiveDescription = description ?? `Synced ${syncedCount} Students`;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.snackbar}>
        <View style={styles.contentRow}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark" size={14} color="#052e16" />
          </View>

          <View style={styles.textWrap}>
            <ThemedText type="smallBold" style={styles.title}>
              {message}
            </ThemedText>
            <ThemedText type="small" style={styles.description}>
              {effectiveDescription}
            </ThemedText>
          </View>

          <Pressable
            onPress={onClose}
            disabled={!onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && onClose && styles.pressed,
            ]}
          >
            <Ionicons name="close" size={14} color="#d4d4d8" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    right: 12,
    left: 12,
    zIndex: 9999,
  },
  snackbar: {
    backgroundColor: "#14532d",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  successIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#ffffff",
  },
  description: {
    color: "#d4d4d8",
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
});
