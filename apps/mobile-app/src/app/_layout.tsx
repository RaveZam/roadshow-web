import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import SyncedSnackbar from "@/components/ui/syncedSnackbar";
import bootstrapDatabase from "../../lib/sqlite/bootstrap";
import { useSync } from "../../lib/services/useSync";

export default function TabLayout() {
  const router = useRouter();
  const { syncedSnackbarVisible, syncedCount, hideSyncedSnackbar } = useSync();

  const [fontsLoaded] = useFonts({
    Geist: require("../../assets/fonts/Geist-Variable.ttf"),
  });

  useEffect(() => {
    bootstrapDatabase();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <SyncedSnackbar
        visible={syncedSnackbarVisible}
        synced={syncedSnackbarVisible}
        syncedCount={syncedCount}
        message="Sync complete"
        onClose={hideSyncedSnackbar}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            title: "Masterlist",
            headerRight: () => (
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => router.push("../history")}
                  style={({ pressed }) => [
                    styles.headerButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="time-outline" size={24} color="#3f3f46" />
                </Pressable>
                <Pressable
                  onPress={() => router.push("../settings")}
                  style={({ pressed }) => [
                    styles.headerButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="settings-outline" size={24} color="#3f3f46" />
                </Pressable>
              </View>
            ),
          }}
        />
        <Stack.Screen name="qr-section" />
        <Stack.Screen
          name="student-screen/[studentId]"
          options={{
            headerShown: true,
            title: "Student Data",
          }}
        />
        <Stack.Screen
          name="history"
          options={{
            headerShown: true,
            title: "History",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: "Settings",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 4,
  },
  pressed: { opacity: 0.75 },
});
