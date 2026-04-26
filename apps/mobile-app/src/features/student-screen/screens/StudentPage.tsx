import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import LocalAttendanceNote from "../components/LocalAttendanceNote";
import {
  getAttendanceLogsByStudentId,
  AttendanceLog,
} from "../../../../lib/sqlite/dao/attendance-logs-dao";
import { getEventSettings } from "../../../../lib/sqlite/dao/event-settings-dao";

function getEventDays(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    days.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function formatTime(time: string | null): string {
  if (!time) return "—";
  const date = new Date(time);
  if (!isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    });
  }
  return time;
}

const PERIODS: Array<"morning" | "afternoon"> = ["morning", "afternoon"];

export default function StudentPage() {
  const params = useLocalSearchParams<{
    studentId?: string;
    studentName?: string;
    supabaseId?: string;
  }>();

  const studentId = params.studentId ?? "";
  const studentName = params.studentName ?? "Unknown Student";
  const supabaseId = params.supabaseId ?? "";

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [eventDays, setEventDays] = useState<string[]>([]);

  useEffect(() => {
    const fetchedLogs = getAttendanceLogsByStudentId(supabaseId);
    setLogs(fetchedLogs);

    const settings = getEventSettings();
    if (settings?.start_date && settings?.end_date) {
      setEventDays(getEventDays(settings.start_date, settings.end_date));
    } else {
      const uniqueDates = [...new Set(fetchedLogs.map((l) => l.date))].sort();
      setEventDays(uniqueDates);
    }
  }, [supabaseId]);

  function getLog(
    date: string,
    period: "morning" | "afternoon",
  ): AttendanceLog | undefined {
    return logs.find((l) => l.date === date && l.period === period);
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <ThemedText type="smallBold">Student Name</ThemedText>
              <ThemedText type="small">{studentName}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText type="smallBold">Student ID</ThemedText>
              <ThemedText type="small">{studentId}</ThemedText>
            </View>
          </View>

          <ThemedView type="backgroundSelected" style={styles.table}>
            <View style={styles.tableHeader}>
              <ThemedText type="smallBold" style={styles.dayCol}>
                Day
              </ThemedText>
              <ThemedText type="smallBold" style={styles.periodCol}>
                Period
              </ThemedText>
              <ThemedText type="smallBold" style={styles.timeCol}>
                In
              </ThemedText>
              <ThemedText type="smallBold" style={styles.timeCol}>
                Out
              </ThemedText>
            </View>

            {eventDays.length === 0 ? (
              <View style={styles.tableRow}>
                <ThemedText type="small" style={styles.emptyText}>
                  No attendance records
                </ThemedText>
              </View>
            ) : (
              eventDays.flatMap((date, dayIndex) =>
                PERIODS.map((period) => {
                  const log = getLog(date, period);
                  return (
                    <View key={`${date}-${period}`} style={styles.tableRow}>
                      <ThemedText type="small" style={styles.dayCol}>
                        {period === "morning" ? `Day ${dayIndex + 1}` : ""}
                      </ThemedText>
                      <ThemedText type="small" style={styles.periodCol}>
                        {period === "morning" ? "Morning" : "Afternoon"}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={[
                          styles.timeCol,
                          log?.time_in ? styles.timePresent : styles.timeAbsent,
                        ]}
                      >
                        {formatTime(log?.time_in ?? null)}
                      </ThemedText>
                      <ThemedText
                        type="small"
                        style={[
                          styles.timeCol,
                          log?.time_out
                            ? styles.timePresent
                            : styles.timeAbsent,
                        ]}
                      >
                        {formatTime(log?.time_out ?? null)}
                      </ThemedText>
                    </View>
                  );
                }),
              )
            )}
          </ThemedView>
        </ThemedView>
        <LocalAttendanceNote />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    paddingTop: 0,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  infoBlock: {
    gap: Spacing.two,
  },
  infoRow: {
    gap: Spacing.half,
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  dayCol: { width: "15%" },
  periodCol: { width: "30%" },
  timeCol: { width: "27.5%" },
  timePresent: { color: "#16a34a" },
  timeAbsent: { opacity: 0.3 },
  emptyText: { flex: 1, textAlign: "center", opacity: 0.4 },
});
