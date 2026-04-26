import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import { Button, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import {
  getStudentById,
  type StudentRecord,
} from "../../../../lib/sqlite/dao/get-student-dao";
import { scanStudent, type ScanResult } from "../hooks/useScanner";

type ModalState = {
  visible: boolean;
  title: string;
  subtitle: string;
  color: string;
};

const MODAL_INITIAL: ModalState = {
  visible: false,
  title: "",
  subtitle: "",
  color: "#14532d",
};

function getModalContent(result: ScanResult): Omit<ModalState, "visible"> {
  switch (result.status) {
    case "time_in":
      return {
        title: "Time In Recorded",
        subtitle: `Student has been timed in for the ${result.period} session.`,
        color: "#14532d",
      };
    case "time_out":
      return {
        title: "Time Out Recorded",
        subtitle: `Student has been timed out for the ${result.period} session.`,
        color: "#1e3a5f",
      };
    case "already_timed_in":
      return {
        title: "Already Timed In",
        subtitle: `Student has already timed in for the ${result.period} session.`,
        color: "#92400e",
      };
    case "already_timed_out":
      return {
        title: "Already Timed Out",
        subtitle: `Student has already timed out for the ${result.period} session.`,
        color: "#92400e",
      };
    case "outside_window":
      return {
        title: "Outside Scan Window",
        subtitle: "The current time is outside any configured time-in or time-out window.",
        color: "#991b1b",
      };
    case "no_settings":
      return {
        title: "No Event Settings",
        subtitle: "Event settings have not been configured yet. Please sync first.",
        color: "#991b1b",
      };
  }
}

export default function Scanner() {
  const lastScanAtRef = useRef(0);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [modal, setModal] = useState<ModalState>(MODAL_INITIAL);
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
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
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

  const closeModal = () => setModal(MODAL_INITIAL);

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
            const scanResult = scanStudent(studentId);
            const student = getStudentById(studentId);
            setLastScannedStudent(student ?? null);

            const content = getModalContent(scanResult);
            setModal({ visible: true, ...content });

            // Auto-close success modals after 1.5s
            if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
            if (scanResult.status === "time_in" || scanResult.status === "time_out") {
              autoCloseRef.current = setTimeout(closeModal, 1500);
            }
          } catch (error) {
            console.log("Failed to scan student", error);
          }
        }}
      />

      <Modal
        visible={modal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: modal.color }]}>
              {modal.title}
            </Text>
            <Text style={styles.subtitle}>{modal.subtitle}</Text>
            {lastScannedStudent && (
              <Text style={styles.studentId}>
                {lastScannedStudent.first_name} {lastScannedStudent.last_name} (
                {lastScannedStudent.student_id})
              </Text>
            )}
            <Pressable
              onPress={closeModal}
              style={({ pressed }) => [
                styles.modalButton,
                { backgroundColor: modal.color },
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
