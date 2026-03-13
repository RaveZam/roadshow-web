import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  getStudentById,
  type StudentRecord,
} from "../../../../lib/sqlite/dao/get-student-dao";
import { hasStudentAttendedToday, scanStudent } from "../hooks/useScanner";

export default function Scanner() {
  const lastScanAtRef = useRef(0);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadyAttendedModal, setShowAlreadyAttendedModal] =
    useState(false);
  const [lastScannedStudent, setLastScannedStudent] =
    useState<StudentRecord | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera permission is required.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={(result) => {
          const now = Date.now();
          if (now - lastScanAtRef.current < 2000) return;
          lastScanAtRef.current = now;

          const studentId = result.data.trim();
          if (!studentId) return;

          try {
            if (hasStudentAttendedToday(studentId)) {
              const student = getStudentById(studentId);
              setLastScannedStudent(student ?? null);
              setShowAlreadyAttendedModal(true);
              return;
            }
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
            <Text style={styles.modalTitle}>Scan successful</Text>
            <Text style={styles.subtitle}>
              Student has been marked present today.
            </Text>
            {lastScannedStudent && (
              <Text style={styles.studentId}>
                {lastScannedStudent.first_name} {lastScannedStudent.last_name} (
                {lastScannedStudent.student_id})
              </Text>
            )}
            <Pressable
              onPress={() => setShowSuccessModal(false)}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAlreadyAttendedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlreadyAttendedModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Student already attended</Text>
            <Text style={styles.subtitle}>
              This student has already been marked present today.
            </Text>
            {lastScannedStudent && (
              <Text style={styles.studentId}>
                {lastScannedStudent.first_name} {lastScannedStudent.last_name} (
                {lastScannedStudent.student_id})
              </Text>
            )}
            <Pressable
              onPress={() => setShowAlreadyAttendedModal(false)}
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>OK</Text>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#14532d",
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
  modalButton: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#14532d",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
  },
});
