import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const DAYS = ["Day 1", "Day 2", "Day 3"] as const;

function LocalAttendanceNote() {
  return (
    <ThemedText type="small" style={styles.note}>
      This is only your local copy of attendance, previous date or future
      attendance record might be recorded from other Attendance takers. All data
      is merged on the admin's side.
    </ThemedText>
  );
}

export default function StudentScreen() {
  const params = useLocalSearchParams<{
    studentId?: string;
    studentName?: string;
  }>();

  const studentId = params.studentId ?? "";
  const studentName = params.studentName ?? "Unknown Student";

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
              <ThemedText type="smallBold" style={styles.statusCol}>
                Attendance
              </ThemedText>
            </View>
            {DAYS.map((day) => (
              <View key={day} style={styles.tableRow}>
                <ThemedText type="small" style={styles.dayCol}>
                  {day}
                </ThemedText>
                <ThemedText type="small" style={styles.statusCol}>
                  -
                </ThemedText>
              </View>
            ))}
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
  dayCol: { width: "50%" },
  statusCol: { width: "50%" },
  note: {
    color: "#71717a",
    marginTop: "auto",
    opacity: 0.45,
    fontStyle: "italic",
    paddingHorizontal: Spacing.two,
  },
});
