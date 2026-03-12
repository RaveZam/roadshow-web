import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { db } from "../../../../lib/sqlite/db";

const ACCENT_GREEN = "#059669";
const ACCENT_RED = "#dc2626";

export default function SettingsPage() {
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [lastFetchStatus, setLastFetchStatus] = useState("Not fetched yet");
  const [lastResetStatus, setLastResetStatus] = useState("Not wiped yet");
  const pendingSyncCount = 12;

  const wipeLocalDatabase = () => {
    try {
      db.execSync(`
        DELETE FROM outbox;
        DELETE FROM attendance;
        DELETE FROM students;
        DELETE FROM section;
        DELETE FROM sqlite_sequence WHERE name='outbox';
      `);
      setLastResetStatus("Wiped just now");
    } catch (error) {
      console.log("[sqlite] Failed to wipe local tables", error);
      setLastResetStatus("Wipe failed");
    } finally {
      setShowResetModal(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">Settings</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Data</ThemedText>

          <Pressable
            onPress={() => setShowFetchModal(true)}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={styles.actionButtonText}>
              Fetch Students
            </ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary">
            Last fetch: {lastFetchStatus}
          </ThemedText>

          <Pressable
            onPress={() => setShowResetModal(true)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.destructiveButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={styles.actionButtonText}>
              Wipe Local Database
            </ThemedText>
          </Pressable>

          <ThemedText type="small" themeColor="textSecondary">
            Last wipe: {lastResetStatus}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">Sync</ThemedText>
          <ThemedText type="small">
            Pending sync ({pendingSyncCount})
          </ThemedText>
        </ThemedView>
      </SafeAreaView>

      <Modal
        visible={showFetchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFetchModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="smallBold">Fetch students?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Do you want to fetch students now?
            </ThemedText>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowFetchModal(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.noButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold">No</ThemedText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setLastFetchStatus("Fetched just now");
                  setShowFetchModal(false);
                }}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.yesButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={styles.actionButtonText}>
                  Yes
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="smallBold">Wipe local database?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              This deletes all local outbox, attendance, students, and section
              rows.
            </ThemedText>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowResetModal(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.noButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold">Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={wipeLocalDatabase}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.destructiveButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={styles.actionButtonText}>
                  Wipe
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT_GREEN,
  },
  destructiveButton: {
    backgroundColor: ACCENT_RED,
    borderColor: ACCENT_RED,
  },
  actionButtonText: {
    color: "#ffffff",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.three,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  modalButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  noButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d4d4d8",
  },
  yesButton: {
    backgroundColor: ACCENT_GREEN,
    borderColor: ACCENT_GREEN,
  },
  pressed: { opacity: 0.75 },
});
