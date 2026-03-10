import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import Scanner from "../components/Scanner";

const FRAME_GREEN = "#000000";
const CORNER_SIZE = 36;
const CORNER_THICKNESS = 10;

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
        <View style={styles.scannerWrapper}>
          <ThemedView style={styles.scannerContainer}>
            <Scanner />
          </ThemedView>
          <ScannerFrame />
        </View>
        <ThemedText type="title" style={styles.headerText}>
          Scan QR Code
        </ThemedText>
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
    padding: Spacing.three,
    gap: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 28,
    lineHeight: 34,
  },
  placeholder: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  actionButton: {
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
  },
  actionButtonText: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.75,
  },
  scannerWrapper: {
    aspectRatio: 1,
    height: "30%",
    width: "30%",
    position: "relative",
  },
  scannerContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: "hidden",
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  edgeTopLeft: { left: 0, top: 0 },
  edgeTopRight: { right: 0, top: 0 },
  edgeBottomLeft: { left: 0, bottom: 0 },
  edgeBottomRight: { right: 0, bottom: 0 },
  barTopLeft: { left: 0, top: 0 },
  barTopRight: { right: 0, top: 0 },
  barBottomLeft: { left: 0, bottom: 0 },
  barBottomRight: { right: 0, bottom: 0 },
});
