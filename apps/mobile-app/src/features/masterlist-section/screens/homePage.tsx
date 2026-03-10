import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { Fonts, Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const ACCENT_GREEN = "#059669";

const SAMPLE_STUDENTS = [
  {
    studentId: "2026-001",
    fname: "Maria",
    lname: "Santos",
    section: "BSIT 3A",
  },
  {
    studentId: "2026-002",
    fname: "Juan",
    lname: "Dela Cruz",
    section: "BSCS 2B",
  },
  { studentId: "2026-003", fname: "Ana", lname: "Reyes", section: "BSBA 1C" },
  {
    studentId: "2026-004",
    fname: "Carlos",
    lname: "Villanueva",
    section: "BSED 4A",
  },
];

const SECTION_OPTIONS = [
  "All Sections",
  "BSIT 3A",
  "BSCS 2B",
  "BSBA 1C",
  "BSED 4A",
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [showFilter, setShowFilter] = useState(false);

  const visibleStudents = useMemo(() => {
    return SAMPLE_STUDENTS.filter((student) => {
      const matchesSection =
        selectedSection === "All Sections" ||
        student.section === selectedSection;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        student.studentId.toLowerCase().includes(normalizedQuery) ||
        student.fname.toLowerCase().includes(normalizedQuery) ||
        student.lname.toLowerCase().includes(normalizedQuery) ||
        student.section.toLowerCase().includes(normalizedQuery);
      return matchesSection && matchesSearch;
    });
  }, [query, selectedSection]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.listCard}>
          <View style={styles.controlsRow}>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search student or section"
                placeholderTextColor="#a1a1aa"
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filterWrapper}>
              <Pressable
                onPress={() => setShowFilter((prev) => !prev)}
                style={({ pressed }) => [
                  styles.filterButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText
                  type="small"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.filterButtonText}
                >
                  {selectedSection}
                </ThemedText>
                <Ionicons
                  name={showFilter ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#3f3f46"
                />
              </Pressable>

              {showFilter && (
                <ThemedView type="backgroundSelected" style={styles.dropdown}>
                  {SECTION_OPTIONS.map((section) => (
                    <Pressable
                      key={section}
                      onPress={() => {
                        setSelectedSection(section);
                        setShowFilter(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText type="small">{section}</ThemedText>
                    </Pressable>
                  ))}
                </ThemedView>
              )}
            </View>
          </View>

          <ThemedView type="backgroundSelected" style={styles.tableHeader}>
            <ThemedText type="smallBold" style={styles.nameCol}>
              Name
            </ThemedText>
            <ThemedText type="smallBold" style={styles.sectionCol}>
              Section
            </ThemedText>
          </ThemedView>

          <ScrollView
            style={styles.rowsScroll}
            contentContainerStyle={styles.rowsContainer}
          >
            {visibleStudents.map((student) => (
              <Pressable
                key={student.studentId}
                onPress={() =>
                  router.push({
                    pathname: "/student-screen/[studentId]",
                    params: {
                      studentId: student.studentId,
                      studentName: `${student.fname} ${student.lname}`,
                    },
                  })
                }
                style={({ pressed }) => [
                  styles.tableRow,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="small" style={styles.nameCol}>
                  {`${student.fname} ${student.lname}`}
                </ThemedText>
                <ThemedText type="small" style={styles.sectionCol}>
                  {student.section}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </ThemedView>

        <Pressable
          onPress={() => router.push("/qr-section")}
          style={({ pressed }) => [
            styles.scanButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="qr-code-outline" size={24} color="#ffffff" />
          <ThemedText type="smallBold" style={styles.actionButtonText}>
            Scan QR
          </ThemedText>
        </Pressable>
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
    gap: Spacing.two,
  },
  actionButton: {
    alignSelf: "flex-start",
    backgroundColor: ACCENT_GREEN,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  actionButtonText: { color: "#ffffff", letterSpacing: 0.2 },
  listCard: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  controlsRow: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "flex-start",
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    fontFamily: Fonts.sans,
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    color: "#3f3f46",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  filterWrapper: {
    minWidth: 42,
    width: 120,
    flexShrink: 0,
    position: "relative",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    minWidth: 42,
    width: "100%",
    minHeight: 42,
    height: 42,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  filterButtonText: { flex: 1, color: "#3f3f46" },
  dropdown: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 42 + Spacing.one,
    zIndex: 10,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  dropdownItem: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    backgroundColor: "#ffffff",
  },
  tableHeader: {
    flexDirection: "row",
    borderRadius: 8,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  rowsScroll: { flex: 1 },
  rowsContainer: { paddingTop: Spacing.one, gap: Spacing.one },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  nameCol: { width: "50%" },
  sectionCol: { width: "50%" },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: ACCENT_GREEN,
  },
  pressed: { opacity: 0.75 },
});
