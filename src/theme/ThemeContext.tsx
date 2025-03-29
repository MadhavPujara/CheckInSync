import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useColorScheme } from "react-native";

const THEME_PREFERENCE_KEY = "theme_preference";

type ThemeType = "light" | "dark" | "system";

interface ThemeContextType {
    themePreference: ThemeType;
    effectiveTheme: "light" | "dark";
    setThemePreference: (theme: ThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreferenceState] =
        useState<ThemeType>("system");

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await SecureStore.getItemAsync(
                THEME_PREFERENCE_KEY
            );
            if (savedTheme) {
                setThemePreferenceState(savedTheme as ThemeType);
            }
        } catch (error) {
            console.error("Failed to load theme preference:", error);
        }
    };

    const setThemePreference = async (theme: ThemeType) => {
        try {
            await SecureStore.setItemAsync(THEME_PREFERENCE_KEY, theme);
            setThemePreferenceState(theme);
        } catch (error) {
            console.error("Failed to save theme preference:", error);
        }
    };

    // Determine the actual theme to use based on preference
    const effectiveTheme =
        themePreference === "system"
            ? systemColorScheme || "light"
            : themePreference;

    return (
        <ThemeContext.Provider
            value={{
                themePreference,
                effectiveTheme,
                setThemePreference,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
};
