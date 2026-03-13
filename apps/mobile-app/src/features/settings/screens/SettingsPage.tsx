import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import SyncedSnackbar from "@/components/ui/syncedSnackbar";
import { Spacing } from "@/constants/theme";
import { getOutbox } from "../../../../lib/sqlite/dao/outbox-dao";
import { useSync } from "../../../../lib/services/useSync";

export default function SettingsPage() {
  const pendingSyncCount = getOutbox().length;
  const { sync, syncedSnackbarVisible, syncedCount, hideSyncedSnackbar } =
    useSync();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            Settings
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">Trigger Sync</ThemedText>
            <ThemedText style={styles.helperText}>
              Push offline attendance records to the server. (Just in case auto
              sync doesnt trigger)
            </ThemedText>
            <Pressable
              onPress={sync}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={styles.actionButtonText}>
                Sync ({pendingSyncCount} Students)
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Developed by Raven Zamora
          </ThemedText>
          <ThemedText style={styles.footerText}>isu-roadshow@2026</ThemedText>
        </ThemedView>
      </SafeAreaView>

      <SyncedSnackbar
        visible={syncedSnackbarVisible}
        synced={syncedSnackbarVisible}
        syncedCount={syncedCount}
        message="Sync complete"
        onClose={hideSyncedSnackbar}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "space-between",
  },
  content: {
    gap: Spacing.three,
  },
  title: {
    marginTop: Spacing.one,
  },
  card: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  helperText: {
    opacity: 0.5,
    marginBottom: Spacing.two,
    fontSize: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  actionButtonText: {
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: "center",
    gap: 2,
    paddingBottom: Spacing.one,
  },
  footerText: {
    opacity: 0.55,
  },
  pressed: { opacity: 0.75 },
});
