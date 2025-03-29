import { Stack } from "expo-router";
import { useEffect, useCallback } from "react";
import { PaperProvider, IconButton } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { lightTheme, darkTheme } from "@/theme/index";
import { ThemeProvider, useThemeContext } from "@/theme/ThemeContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppNavigator() {
    const { effectiveTheme, themePreference, setThemePreference } =
        useThemeContext();
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    // When both the theme is loaded and fonts are loaded, hide the splash screen
    const onLayoutRootView = useCallback(async () => {
        if (loaded) {
            await SplashScreen.hideAsync();
        }
    }, [loaded]);

    // Hide the splash screen after resources are loaded and theme is determined
    useEffect(() => {
        if (loaded) {
            onLayoutRootView();
        }
    }, [loaded, onLayoutRootView]);

    const toggleTheme = async () => {
        const newTheme =
            themePreference === "system"
                ? "light"
                : themePreference === "light"
                ? "dark"
                : "system";
        await setThemePreference(newTheme);
    };

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
                            size={24}
                            iconColor={
                                effectiveTheme === "dark"
                                    ? "#FFFFFF"
                                    : "#000000"
                            }
                        />
                    ),
                }}
            >
                <Stack.Screen
                    name="index"
                    options={
                        {
                            // Hide the header completely on the index screen if desired
                            // headerShown: false,
                        }
                    }
                />
                <Stack.Screen
                    name="(auth)/setup"
                    options={{
                        // You can customize headers for specific screens
                        title: "Setup",
                    }}
                />
            </Stack>
        </PaperProvider>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AppNavigator />
        </ThemeProvider>
    );
}
