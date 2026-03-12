import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

export default function LocalAttendanceNote() {
  return (
    <ThemedText type="small" style={styles.note}>
      This is only your local copy of attendance, previous date or future
      attendance record might be recorded from other Attendance takers. All data
      is merged on the admin&apos;s side.
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  note: {
    color: "#71717a",
    marginTop: "auto",
    opacity: 0.45,
    fontStyle: "italic",
    paddingHorizontal: Spacing.two,
  },
});
