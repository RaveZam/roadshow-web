import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import LocalAttendanceNote from "../components/LocalAttendanceNote";
import { getAttendanceByStudentId } from "../../../../lib/sqlite/dao/attendance-dao";
import { useEffect } from "react";
type AttendanceRow = {
  id: number;
  student_id: string;
  day1: number;
  day2: number;
  day3: number;
};

export default function StudentPage() {
  const params = useLocalSearchParams<{
    studentId?: string;
    studentName?: string;
    supabaseId?: string;
  }>();

  const studentId = params.studentId ?? "";
  const studentName = params.studentName ?? "Unknown Student";
  const supabaseId = params.supabaseId ?? "";
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    const attendance = getAttendanceByStudentId(supabaseId) as AttendanceRow[];
    setAttendance(attendance);
    console.log(attendance);
  }, [supabaseId]);

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

            <View style={styles.tableRow}>
              <ThemedText type="small" style={styles.dayCol}>
                Day 1
              </ThemedText>
              <ThemedText
                type="small"
                style={[
                  styles.statusCol,
                  attendance[0]?.day1
                    ? styles.statusPresent
                    : styles.statusAbsent,
                ]}
              >
                {attendance[0]?.day1 ? "Present" : "Absent"}
              </ThemedText>
            </View>
            <View style={styles.tableRow}>
              <ThemedText type="small" style={styles.dayCol}>
                Day 2
              </ThemedText>
              <ThemedText
                type="small"
                style={[
                  styles.statusCol,
                  attendance[0]?.day2
                    ? styles.statusPresent
                    : styles.statusAbsent,
                ]}
              >
                {attendance[0]?.day2 ? "Present" : "Absent"}
              </ThemedText>
            </View>
            <View style={styles.tableRow}>
              <ThemedText type="small" style={styles.dayCol}>
                Day 3
              </ThemedText>
              <ThemedText
                type="small"
                style={[
                  styles.statusCol,
                  attendance[0]?.day3
                    ? styles.statusPresent
                    : styles.statusAbsent,
                ]}
              >
                {attendance[0]?.day3 ? "Present" : "Absent"}
              </ThemedText>
            </View>
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
  statusPresent: { color: "#16a34a" },
  statusAbsent: { opacity: 0.2 },
});
