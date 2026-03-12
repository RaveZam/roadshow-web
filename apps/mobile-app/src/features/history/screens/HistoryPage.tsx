import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { getAttendanceWithStudentNames } from "../../../../lib/sqlite/dao/attendance-dao";

type AttendanceRowWithName = {
  id: string;
  student_id: string;
  day1: number;
  day2: number;
  day3: number;
  scanned_at: string;
  first_name: string | null;
  last_name: string | null;
};

function formatScannedAt(utcString: string): string {
  if (!utcString) return "—";

  const d = new Date(utcString.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return "—";

  const phDate = new Date(d.getTime() + 8 * 60 * 60 * 1000);

  const dateStr = phDate.toLocaleDateString();
  const hours24 = phDate.getUTCHours();
  const minutes = phDate.getUTCMinutes();
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const minuteStr = minutes.toString().padStart(2, "0");
  const timeStr = `${hours12}:${minuteStr} ${ampm}`;

  return `${dateStr} ${timeStr}`;
}

function displayName(row: AttendanceRowWithName): string {
  if (row.first_name != null && row.last_name != null) {
    return `${row.first_name} ${row.last_name}`.trim();
  }
  return row.student_id;
}

export default function HistoryPage() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRowWithName[]>(
    [],
  );

  useEffect(() => {
    const rows = getAttendanceWithStudentNames() as AttendanceRowWithName[];
    setAttendanceLogs(rows);
  }, []);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Attendance History</ThemedText>

          <FlatList
            data={attendanceLogs}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ThemedView type="backgroundSelected" style={styles.listItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatScannedAt(item.scanned_at)}
                </ThemedText>
                <ThemedText type="smallBold">
                  Student: {displayName(item)}
                </ThemedText>
                <View style={styles.daysRow}>
                  <ThemedText
                    type="small"
                    style={item.day1 ? styles.statusPresent : undefined}
                  >
                    Day 1: {toStatus(item.day1)}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={item.day2 ? styles.statusPresent : undefined}
                  >
                    Day 2: {toStatus(item.day2)}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={item.day3 ? styles.statusPresent : undefined}
                  >
                    Day 3: {toStatus(item.day3)}
                  </ThemedText>
                </View>
              </ThemedView>
            )}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No attendance logs yet.
              </ThemedText>
            }
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function toStatus(value: number) {
  return value ? "Present" : "Absent";
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    paddingTop: 0,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  listItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: Spacing.two,
    gap: Spacing.half,
  },
  daysRow: {
    gap: Spacing.half,
  },
  statusPresent: {
    color: "#4ade80",
  },
});
