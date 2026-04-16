import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import SyncedSnackbar from "@/components/ui/syncedSnackbar";
import { Spacing } from "@/constants/theme";
import { getOutbox } from "../../../../lib/sqlite/dao/outbox-dao";
import { useSync } from "../../../../lib/services/useSync";

export default function SettingsPage() {
  const [pendingSyncCount, setPendingSyncCount] = useState(
    () => getOutbox().length,
  );
  const { sync, syncedSnackbarVisible, syncedCount, hideSyncedSnackbar } =
    useSync();

  const handleSync = useCallback(async () => {
    await sync();
    setPendingSyncCount(getOutbox().length);
  }, [sync]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.content}>
          <ThemedText type="subtitle" style={styles.title}>
            Settings
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">Event Dates</ThemedText>
            <ThemedText style={styles.helperText}>
              Attendance is recorded only on these days.
            </ThemedText>
            {[
              { label: "Day 1", day: "21", month: "APR", year: "2026" },
              { label: "Day 2", day: "22", month: "APR", year: "2026" },
              { label: "Day 3", day: "23", month: "APR", year: "2026" },
            ].map((item, index) => (
              <ThemedView key={item.label} style={styles.dateRow}>
                <ThemedView style={styles.dateBadge}>
                  <ThemedText style={styles.dateBadgeNumber}>
                    {index + 1}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.dateLabelGroup}>
                  <ThemedText type="smallBold">{item.label}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.dateChip}>
                  <ThemedText style={styles.dateChipDay}>{item.day}</ThemedText>
                  <ThemedView style={styles.dateChipDivider} />
                  <ThemedText style={styles.dateChipMonth}>
                    {item.month} {item.year}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ))}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">Trigger Sync</ThemedText>
            <ThemedText style={styles.helperText}>
              Push offline attendance records to the server. (Just in case auto
              sync doesnt trigger)
            </ThemedText>
            <Pressable
              onPress={handleSync}
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
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 5,
  },
  dateBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadgeNumber: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  dateLabelGroup: {
    flex: 1,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  dateChipDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  dateChipDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#cbd5e1",
  },
  dateChipMonth: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
});
