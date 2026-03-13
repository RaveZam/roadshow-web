import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import Scanner from "../components/Scanner";

const FRAME_GREEN = "#000000";
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

function ScannerFrame() {
  return (
    <View style={styles.frameOverlay} pointerEvents="none">
      <View style={[styles.cornerEdge, styles.edgeTopLeft]} />
      <View style={[styles.cornerEdge, styles.edgeTopRight]} />
      <View style={[styles.cornerEdge, styles.edgeBottomLeft]} />
      <View style={[styles.cornerEdge, styles.edgeBottomRight]} />
      <View style={[styles.cornerBar, styles.barTopLeft]} />
      <View style={[styles.cornerBar, styles.barTopRight]} />
      <View style={[styles.cornerBar, styles.barBottomLeft]} />
      <View style={[styles.cornerBar, styles.barBottomRight]} />
    </View>
  );
}

export default function QRSection() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.headerText}>
          SCAN QR CODE
        </ThemedText>

        <View style={styles.panel}>
          <ThemedText type="default" style={styles.tooltipText}>
            Hold your device over a QR code to scan it
          </ThemedText>

          <View style={styles.scannerWrapper}>
            <ThemedView style={styles.scannerContainer}>
              <Scanner />
            </ThemedView>
            <ScannerFrame />
          </View>

          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    gap: Spacing.four,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerText: {
    marginTop: Spacing.four,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 30,
    lineHeight: 36,
  },
  panel: {
    width: "88%",
    maxWidth: 360,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    backgroundColor: "#f4f4f5",
    shadowColor: "#000000",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tooltipText: {
    textAlign: "center",
    color: "#52525b",
    fontSize: 18,
    lineHeight: 24,
  },
  scannerWrapper: {
    aspectRatio: 1,
    width: "100%",
    maxWidth: 220,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  scannerContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: "hidden",
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
  },
  cornerEdge: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_THICKNESS,
    backgroundColor: FRAME_GREEN,
    borderRadius: 0,
  },
  cornerBar: {
    position: "absolute",
    width: CORNER_THICKNESS,
    height: CORNER_SIZE,
    backgroundColor: FRAME_GREEN,
    borderRadius: 0,
  },
  edgeTopLeft: { left: 10, top: 10 },
  edgeTopRight: { right: 10, top: 10 },
  edgeBottomLeft: { left: 10, bottom: 10 },
  edgeBottomRight: { right: 10, bottom: 10 },
  barTopLeft: { left: 10, top: 10 },
  barTopRight: { right: 10, top: 10 },
  barBottomLeft: { left: 10, bottom: 10 },
  barBottomRight: { right: 10, bottom: 10 },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d4d4d8",
  },
});
