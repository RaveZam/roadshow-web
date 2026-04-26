import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import SyncedSnackbar from "@/components/ui/syncedSnackbar";
import { Spacing } from "@/constants/theme";
import {
  getEventSettings,
  type EventSettings,
} from "../../../../lib/sqlite/dao/event-settings-dao";
import { getOutbox } from "../../../../lib/sqlite/dao/outbox-dao";
import { useSync } from "../../../../lib/services/useSync";

function formatTime(time: string | null): string {
  if (!time) return "--:--";
  // time comes as "HH:MM:SS" or "HH:MM" from the DB
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${ampm}`;
}

function formatDate(dateStr: string | null): {
  day: string;
  month: string;
  year: string;
} | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return {
    day: String(d.getDate()),
    month: months[d.getMonth()],
    year: String(d.getFullYear()),
  };
}

function TimeSlotRow({
  label,
  timeIn,
  cutoff,
  accent,
}: {
  label: string;
  timeIn: string | null;
  cutoff: string | null;
  accent: string;
}) {
  return (
    <View style={slotStyles.row}>
      <View style={[slotStyles.indicator, { backgroundColor: accent }]} />
      <View style={slotStyles.labelCol}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </View>
      <View style={slotStyles.timesCol}>
        <View style={slotStyles.timeChip}>
          <ThemedText style={slotStyles.timeValue}>
            {formatTime(timeIn)}
          </ThemedText>
        </View>
        <ThemedText style={slotStyles.arrow}>→</ThemedText>
        <View style={[slotStyles.timeChip, slotStyles.cutoffChip]}>
          <ThemedText style={[slotStyles.timeValue, slotStyles.cutoffValue]}>
            {formatTime(cutoff)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function SettingsPage() {
  const [pendingSyncCount, setPendingSyncCount] = useState(
    () => getOutbox().length,
  );
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(() =>
    getEventSettings(),
  );
  const { sync, syncedSnackbarVisible, syncedCount, hideSyncedSnackbar } =
    useSync();

  // Refresh event settings after each sync cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setEventSettings(getEventSettings());
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = useCallback(async () => {
    await sync();
    setPendingSyncCount(getOutbox().length);
    setEventSettings(getEventSettings());
  }, [sync]);

  const startDate = formatDate(eventSettings?.start_date ?? null);
  const endDate = formatDate(eventSettings?.end_date ?? null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="subtitle" style={styles.title}>
            Settings
          </ThemedText>

          {/* ── Event Schedule Card ── */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                Event Schedule
              </ThemedText>
              {eventSettings ? (
                <View style={styles.statusLive}>
                  <View style={styles.statusDot} />
                  <ThemedText style={styles.statusText}>Synced</ThemedText>
                </View>
              ) : (
                <View style={styles.statusOffline}>
                  <ThemedText style={styles.statusTextOffline}>
                    Not synced
                  </ThemedText>
                </View>
              )}
            </View>

            {eventSettings ? (
              <>
                {/* Event Dates */}
                {startDate && endDate && (
                  <View style={styles.dateRange}>
                    <View style={styles.dateChip}>
                      <ThemedText style={styles.dateChipDay}>
                        {startDate.day}
                      </ThemedText>
                      <View style={styles.dateChipDivider} />
                      <ThemedText style={styles.dateChipMonth}>
                        {startDate.month} {startDate.year}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.dateRangeArrow}>—</ThemedText>
                    <View style={styles.dateChip}>
                      <ThemedText style={styles.dateChipDay}>
                        {endDate.day}
                      </ThemedText>
                      <View style={styles.dateChipDivider} />
                      <ThemedText style={styles.dateChipMonth}>
                        {endDate.month} {endDate.year}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Morning Section */}
                <View style={styles.periodSection}>
                  <View style={styles.periodHeader}>
                    <ThemedText type="smallBold" style={styles.periodLabel}>
                      Morning
                    </ThemedText>
                  </View>
                  <View style={styles.slotGroup}>
                    <TimeSlotRow
                      label="Time In"
                      timeIn={eventSettings.morning_in}
                      cutoff={eventSettings.morning_in_cutoff}
                      accent="#22c55e"
                    />
                    <TimeSlotRow
                      label="Time Out"
                      timeIn={eventSettings.morning_out}
                      cutoff={eventSettings.morning_out_cutoff}
                      accent="#ef4444"
                    />
                  </View>
                </View>

                {/* Afternoon Section */}
                <View style={styles.periodSection}>
                  <View style={styles.periodHeader}>
                    <ThemedText type="smallBold" style={styles.periodLabel}>
                      Afternoon
                    </ThemedText>
                  </View>
                  <View style={styles.slotGroup}>
                    <TimeSlotRow
                      label="Time In"
                      timeIn={eventSettings.afternoon_in}
                      cutoff={eventSettings.afternoon_in_cutoff}
                      accent="#22c55e"
                    />
                    <TimeSlotRow
                      label="Time Out"
                      timeIn={eventSettings.afternoon_out}
                      cutoff={eventSettings.afternoon_out_cutoff}
                      accent="#ef4444"
                    />
                  </View>
                </View>

                {/* Legend */}
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#e2e8f0" }]}
                    />
                    <ThemedText style={styles.legendText}>Opens at</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#fef2f2" }]}
                    />
                    <ThemedText style={styles.legendText}>Cutoff</ThemedText>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyText}>
                  No event settings found. Tap Sync to pull from server.
                </ThemedText>
              </View>
            )}
          </ThemedView>

          {/* ── Trigger Sync Card ── */}
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Trigger Sync
            </ThemedText>
            <ThemedText style={styles.helperText}>
              Push offline attendance records to the server. (Just in case auto
              sync doesn't trigger)
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
        </ScrollView>

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

const slotStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  indicator: {
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  labelCol: {
    width: 64,
  },
  timesCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeChip: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cutoffChip: {
    backgroundColor: "#fef2f2",
  },
  timeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    fontVariant: ["tabular-nums"],
  },
  cutoffValue: {
    color: "#dc2626",
  },
  arrow: {
    fontSize: 12,
    color: "#94a3b8",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "space-between",
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    marginTop: Spacing.one,
  },
  card: {
    borderRadius: 14,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  helperText: {
    opacity: 0.5,
    marginBottom: Spacing.one,
    fontSize: 12,
  },
  statusLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16a34a",
  },
  statusOffline: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  statusTextOffline: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
  },
  dateRange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  dateRangeArrow: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
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
  periodSection: {
    gap: 4,
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  periodEmoji: {
    fontSize: 14,
  },
  periodLabel: {
    fontSize: 13,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  slotGroup: {
    paddingLeft: 4,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  emptyState: {
    paddingVertical: Spacing.four,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
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
