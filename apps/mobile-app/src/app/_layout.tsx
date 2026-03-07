import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import bootstrapDatabase from "../../lib/sqlite/bootstrap";

export default function TabLayout() {
  useEffect(() => {
    bootstrapDatabase();
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            title: "Masterlist",
            headerRight: () => (
              <Pressable
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="download-outline" size={24} color="#3f3f46" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="scan-qr" />
        <Stack.Screen
          name="student-screen/[studentId]"
          options={{
            headerShown: true,
            title: "Student Data",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 4,
  },
  pressed: { opacity: 0.75 },
});
