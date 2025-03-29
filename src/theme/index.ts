import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Define our color constants
export const Colors = {
    light: {
        text: "#11181C",
        background: "#fff",
        tint: "#0a7ea4",
        icon: "#687076",
        tabIconDefault: "#687076",
        tabIconSelected: "#0a7ea4",
    },
    dark: {
        text: "#ECEDEE",
        background: "#151718",
        tint: "#fff",
        icon: "#9BA1A6",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: "#fff",
    },
};

// Base theme colors
const baseColors = {
    primary: "#0a7ea4",
    secondary: "#7B1FA2",
    success: "#2E7D32",
    error: "#D32F2F",
    warning: "#FFA000",
};

// Light theme
export const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: baseColors.primary,
        secondary: baseColors.secondary,
        error: baseColors.error,
        background: Colors.light.background,
        onBackground: Colors.light.text,
        surface: "#F5F5F5",
        onSurface: Colors.light.text,
        outline: "#E0E0E0",
        surfaceVariant: "#EEEEEE",
        onSurfaceVariant: Colors.light.text,
    },
};

// Dark theme
export const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: "#29B6F6", // Lighter shade for dark mode
        secondary: "#BA68C8", // Lighter shade for dark mode
        error: "#EF5350",
        background: Colors.dark.background,
        onBackground: Colors.dark.text,
        surface: "#2D2D2D",
        onSurface: Colors.dark.text,
        outline: "#424242",
        surfaceVariant: "#383838",
        onSurfaceVariant: Colors.dark.text,
    },
};

export default {
    Colors,
    lightTheme,
    darkTheme,
    baseColors,
};
