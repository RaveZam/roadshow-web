import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import bootstrapDatabase from "../../lib/sqlite/bootstrap";

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    bootstrapDatabase();
  }, []);

  return (
    <ThemeProvider value={DefaultTheme}>
      <AnimatedSplashOverlay />
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
              <Pressable
                onPress={() => router.push("../settings")}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="settings-outline" size={24} color="#3f3f46" />
              </Pressable>
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
  headerButton: {
    padding: 4,
  },
  pressed: { opacity: 0.75 },
});
