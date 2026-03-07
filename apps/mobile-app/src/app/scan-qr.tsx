import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function ScanQrScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.headerText}>
          QR Scanner
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.placeholder}>
          <ThemedText type="small" themeColor="textSecondary">
            Scanner preview UI placeholder
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={styles.actionButtonText}>
              Open Camera
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  headerText: {
    fontSize: 28,
    lineHeight: 34,
  },
  placeholder: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
  },
  actionButtonText: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.75,
  },
});
