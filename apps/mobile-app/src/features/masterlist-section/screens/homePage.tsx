import React, { useEffect, useMemo, useState } from "react";
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
import { syncStudentsFromApi } from "../../../../lib/services/get-students";
import { getStudents } from "../../../../lib/sqlite/dao/get-student-dao";
import { syncSectionsFromApi } from "../../../../lib/services/get-sections";
import { getSections } from "../../../../lib/sqlite/dao/get-section-dao";
import { checkWifi } from "@/hooks/useWifiChecker";
import SyncedSnackbar from "@/components/ui/syncedSnackbar";

const ACCENT_GREEN = "#059669";

type StudentRow = {
  id: string;
  studentId: string;
  fname: string;
  lname: string;
  section: string;
};

type SectionRow = {
  id: string;
  name: string;
};
export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showSyncSnackbar, setShowSyncSnackbar] = useState(true);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadFromLocal = () => {
      const studentsRows = getStudents();
      const sectionsRows = getSections();

      if (!isMounted) return;

      setStudents(
        studentsRows.map((s: any) => ({
          id: s.id,
          studentId: s.student_id,
          fname: s.first_name,
          lname: s.last_name,
          section: s.section_id,
        })),
      );

      setSections(
        sectionsRows.map((s: any) => ({
          id: s.id,
          name: s.name,
        })),
      );
    };

    const initialize = async () => {
      loadFromLocal();

      try {
        // 2) Only sync if online
        const hasWifi = await checkWifi();
        if (!hasWifi) return;

        await Promise.all([syncSectionsFromApi(), syncStudentsFromApi()]);

        // 3) Reload local after sync so UI updates
        loadFromLocal();
      } catch (error) {
        console.log("sync failed:", error);
        // Keep already-loaded local data
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  const sectionOptions = useMemo(() => {
    return [{ id: null as string | null, name: "All Sections" }, ...sections];
  }, [sections]);

  const visibleStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSection =
        selectedSection === null || student.section === selectedSection;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesSearch =
        !normalizedQuery ||
        student.studentId.toLowerCase().includes(normalizedQuery) ||
        student.fname.toLowerCase().includes(normalizedQuery) ||
        student.lname.toLowerCase().includes(normalizedQuery) ||
        student.section.toLowerCase().includes(normalizedQuery);
      return matchesSection && matchesSearch;
    });
  }, [query, selectedSection, students]);

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
                  {sectionOptions.find((s) => s.id === selectedSection)?.name ??
                    "All Sections"}
                </ThemedText>
                <Ionicons
                  name={showFilter ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#3f3f46"
                />
              </Pressable>

              {showFilter && (
                <ThemedView type="backgroundSelected" style={styles.dropdown}>
                  {sectionOptions.map((section) => (
                    <Pressable
                      key={section.id ?? "all"}
                      onPress={() => {
                        setSelectedSection(section.id);
                        setShowFilter(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && styles.pressed,
                      ]}
                    >
                      <ThemedText type="small">{section.name}</ThemedText>
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
            {visibleStudents.length === 0 && (
              <ThemedView style={styles.emptyState}>
                <ThemedText type="small" style={styles.emptyText}>
                  No students yet. Sync to populate your masterlist.
                </ThemedText>
              </ThemedView>
            )}
            {visibleStudents.map((student) => (
              <Pressable
                key={student.studentId}
                onPress={() =>
                  router.push({
                    pathname: "/student-screen/[studentId]",
                    params: {
                      supabaseId: student.id,
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
                  {sections.find((s) => s.id === student.section)?.name}
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
  topActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  toggleSnackbarButton: {
    minHeight: 34,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  toggleSnackbarText: {
    color: "#3f3f46",
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
  emptyState: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  emptyText: { color: "#71717a" },
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
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  pressed: { opacity: 0.75 },
});
