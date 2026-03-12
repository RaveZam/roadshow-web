import { CameraView } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  getStudentById,
  type StudentRecord,
} from "../../../../lib/sqlite/dao/get-student-dao";
import { scanStudent } from "../hooks/useScanner";

export default function Scanner() {
  const lastScanAtRef = useRef(0);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastScannedStudent, setLastScannedStudent] =
    useState<StudentRecord | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={(result) => {
          const now = Date.now();
          if (now - lastScanAtRef.current < 1000) return;
          lastScanAtRef.current = now;

          const studentId = result.data.trim();
          if (!studentId) return;

          try {
            scanStudent(studentId);
            const student = getStudentById(studentId);
            setLastScannedStudent(student ?? null);
            setShowSuccessModal(true);

            if (successTimeoutRef.current) {
              clearTimeout(successTimeoutRef.current);
            }
            successTimeoutRef.current = setTimeout(() => {
              setShowSuccessModal(false);
            }, 1200);
          } catch (error) {
            console.log("Failed to scan student", error);
          }
        }}
      />

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Success</Text>
            <Text style={styles.subtitle}>Student has been scanned.</Text>
            <Text style={styles.studentId}>
              Name: {lastScannedStudent?.first_name ?? "Unknown"}{" "}
              {lastScannedStudent?.last_name ?? "Student"}
            </Text>
            <Text style={styles.studentId}>
              ID: {lastScannedStudent?.student_id ?? "Not found"}
            </Text>

            <Pressable
              onPress={() => setShowSuccessModal(false)}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },
  subtitle: {
    fontSize: 14,
    color: "#334155",
  },
  studentId: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  button: {
    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});
