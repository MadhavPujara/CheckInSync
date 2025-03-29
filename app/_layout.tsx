import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { PaperProvider, IconButton } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { lightTheme, darkTheme } from "@/theme/index";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const THEME_PREFERENCE_KEY = "theme_preference";

export default function RootLayout() {
    const systemColorScheme = useColorScheme();
    const [userTheme, setUserTheme] = useState<"light" | "dark" | "system">(
        "system"
    );
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync(
                THEME_PREFERENCE_KEY
            );
            if (savedTheme) {
                setUserTheme(savedTheme as "light" | "dark" | "system");
            }
        } catch (error) {
            console.error("Failed to load theme preference:", error);
        }
    };

    const saveThemePreference = async (theme: "light" | "dark" | "system") => {
        try {
            await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, theme);
            setUserTheme(theme);
        } catch (error) {
            console.error("Failed to save theme preference:", error);
        }
    };

    const toggleTheme = () => {
        const newTheme =
            userTheme === "system"
                ? "light"
                : userTheme === "light"
                ? "dark"
                : "system";
        saveThemePreference(newTheme);
    };

    const effectiveTheme =
        userTheme === "system" ? systemColorScheme : userTheme;

    if (!loaded) {
        return null;
    }

    return (
        <PaperProvider
            theme={effectiveTheme === "dark" ? darkTheme : lightTheme}
        >
            <Stack
                screenOptions={{
                    headerRight: () => (
                        <IconButton
                            icon={
                                effectiveTheme === "dark"
                                    ? "weather-night"
                                    : "weather-sunny"
                            }
                            onPress={toggleTheme}
                        />
                    ),
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)/setup" />
            </Stack>
        </PaperProvider>
    );
}
