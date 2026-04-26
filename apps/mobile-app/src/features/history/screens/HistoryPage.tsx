import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { getAttendanceLogsWithStudentNames } from "../../../../lib/sqlite/dao/attendance-logs-dao";

type LogRow = {
  id: string;
  student_id: string;
  period: "morning" | "afternoon";
  time_in: string | null;
  time_out: string | null;
  date: string;
  first_name: string | null;
  last_name: string | null;
};

type DateGroup = {
  date: string;
  logs: LogRow[];
};

function formatTime(time: string | null): string {
  if (!time) return "—";
  const d = new Date(time);
  if (isNaN(d.getTime())) return time;
  return d.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function displayName(row: LogRow): string {
  if (row.first_name != null && row.last_name != null) {
    return `${row.first_name} ${row.last_name}`.trim();
  }
  return row.student_id;
}

function groupByDate(logs: LogRow[]): DateGroup[] {
  const map = new Map<string, LogRow[]>();
  for (const log of logs) {
    const existing = map.get(log.date);
    if (existing) {
      existing.push(log);
    } else {
      map.set(log.date, [log]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, logs]) => ({ date, logs }));
}

export default function HistoryPage() {
  const [groups, setGroups] = useState<DateGroup[]>([]);

  useEffect(() => {
    const rows = getAttendanceLogsWithStudentNames() as LogRow[];
    setGroups(groupByDate(rows));
  }, []);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Time In / Time Out History</ThemedText>

          <FlatList
            data={groups}
            keyExtractor={(item) => item.date}
            contentContainerStyle={styles.listContent}
            renderItem={({ item: group }) => (
              <View style={styles.dateGroup}>
                <ThemedText type="smallBold" style={styles.dateHeader}>
                  {formatDate(group.date)}
                </ThemedText>

                {group.logs.map((log) => (
                  <ThemedView
                    key={log.id}
                    type="backgroundSelected"
                    style={styles.logItem}
                  >
                    <View style={styles.logHeader}>
                      <ThemedText type="smallBold">
                        {displayName(log)}
                      </ThemedText>
                      <View style={styles.periodBadge}>
                        <ThemedText type="small" style={styles.periodText}>
                          {log.period === "morning" ? "AM" : "PM"}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.timesRow}>
                      <View style={styles.timeBlock}>
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          style={styles.timeLabel}
                        >
                          Time In
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={
                            log.time_in ? styles.timePresent : styles.timeAbsent
                          }
                        >
                          {formatTime(log.time_in)}
                        </ThemedText>
                      </View>

                      <View style={styles.timeBlock}>
                        <ThemedText
                          type="small"
                          themeColor="textSecondary"
                          style={styles.timeLabel}
                        >
                          Time Out
                        </ThemedText>
                        <ThemedText
                          type="small"
                          style={
                            log.time_out
                              ? styles.timePresent
                              : styles.timeAbsent
                          }
                        >
                          {formatTime(log.time_out)}
                        </ThemedText>
                      </View>
                    </View>
                  </ThemedView>
                ))}
              </View>
            )}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No time in / time out logs yet.
              </ThemedText>
            }
          />
        </ThemedView>
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
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  dateGroup: {
    gap: Spacing.two,
  },
  dateHeader: {
    color: "#71717a",
  },
  logItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    padding: Spacing.two,
    gap: Spacing.two,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodBadge: {
    backgroundColor: "#f0f0f4",
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  periodText: {
    fontSize: 11,
    fontWeight: "600",
  },
  timesRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  timeBlock: {
    flex: 1,
    gap: 2,
  },
  timeLabel: {
    fontSize: 11,
  },
  timePresent: { color: "#16a34a" },
  timeAbsent: { opacity: 0.3 },
});
