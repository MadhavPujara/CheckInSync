import {
    ViewProps,
    TextProps,
    TouchableOpacityProps,
    StyleProp,
    ViewStyle,
} from "react-native";
import { ReactNode } from "react";

// Testing Library Extensions
import "@testing-library/jest-native/extend-expect";
import { Theme } from "@react-navigation/native";

// Global Test Setup
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

// Core Native Functionality
// Mock Expo Secure Store
jest.mock("expo-secure-store", () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Mock expo-location
jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

// Mock alert
global.alert = jest.fn();

// Mock console.error
global.console.error = jest.fn();

// UI Framework Mocks
// Mock React Native components
jest.mock("react-native", () => {
    const React = require("react");
    return {
        Platform: { select: jest.fn((obj: { default: any }) => obj.default) },
        StyleSheet: {
            create: (styles: Record<string, StyleProp<ViewStyle>>) => styles,
            compose: jest.fn(),
            flatten: (style: StyleProp<ViewStyle>) => {
                if (Array.isArray(style)) {
                    return Object.assign({}, ...style);
                }
                return style || {};
            },
        },
        View: ({
            children,
            testID,
            style,
            ...props
        }: ViewProps & { testID?: string }) =>
            React.createElement("View", { testID, style, ...props }, children),
        Text: ({
            children,
            testID,
            style,
            ...props
        }: TextProps & { testID?: string }) =>
            React.createElement("Text", { testID, style, ...props }, children),
        TouchableOpacity: ({
            children,
            testID,
            style,
            onPress,
            disabled,
            ...props
        }: TouchableOpacityProps & { testID?: string }) =>
            React.createElement(
                "TouchableOpacity",
                { testID, style, onPress, disabled, ...props },
                children
            ),
        useColorScheme: () => "light",
    };
});

// Mock React Native Paper components
jest.mock("react-native-paper", () => {
    const React = require("react");
    const RN = require("react-native");

    // Create base components for our mocks
    const View = ({
        children,
        testID,
        style,
        ...props
    }: {
        children?: React.ReactNode;
        testID?: string;
        style?: any;
        [key: string]: any;
    }) => React.createElement(RN.View, { testID, style, ...props }, children);

    const Text = ({
        children,
        testID,
        style,
        ...props
    }: {
        children?: React.ReactNode;
        testID?: string;
        style?: any;
        [key: string]: any;
    }) => React.createElement(RN.Text, { testID, style, ...props }, children);

    const TouchableOpacity = ({
        children,
        testID,
        style,
        onPress,
        ...props
    }: {
        children?: React.ReactNode;
        testID?: string;
        style?: any;
        onPress?: () => void;
        [key: string]: any;
    }) =>
        React.createElement(
            RN.TouchableOpacity,
            { testID, style, onPress, ...props },
            children
        );

    // Mock Paper components using our base components
    return {
        Appbar: {
            Header: ({
                children,
                testID,
                ...props
            }: {
                children?: ReactNode;
                testID?: string;
                [key: string]: any;
            }) => React.createElement(View, { testID, ...props }, children),

            Action: ({
                onPress,
                testID,
                icon,
                ...props
            }: {
                onPress?: () => void;
                testID?: string;
                icon?: string;
                [key: string]: any;
            }) =>
                React.createElement(TouchableOpacity, {
                    testID,
                    onPress,
                    accessibilityRole: "button",
                    "data-icon": icon,
                    ...props,
                }),

            Content: ({
                title,
                testID,
                ...props
            }: {
                title?: string;
                testID?: string;
                [key: string]: any;
            }) => React.createElement(Text, { testID, ...props }, title),
        },
        Button: ({
            children,
            testID,
            onPress,
            disabled,
            loading,
            ...props
        }: {
            children?: ReactNode;
            testID?: string;
            onPress?: () => void;
            disabled?: boolean;
            loading?: boolean;
            [key: string]: any;
        }) =>
            React.createElement(
                TouchableOpacity,
                {
                    testID,
                    onPress,
                    disabled,
                    accessibilityRole: "button",
                    "data-loading": loading,
                    ...props,
                },
                children
            ),
        PaperProvider: ({
            children,
            theme,
        }: {
            children: ReactNode;
            theme?: Theme;
        }) => children,
        IconButton: ({
            onPress,
            testID,
            icon,
            ...props
        }: {
            onPress?: () => void;
            testID?: string;
            icon?: string;
            [key: string]: any;
        }) =>
            React.createElement(TouchableOpacity, {
                testID,
                onPress,
                accessibilityRole: "button",
                "data-icon": icon,
                ...props,
            }),
        useTheme: () => ({
            dark: false,
            colors: {
                primary: "#0a7ea4",
                secondary: "#7B1FA2",
                error: "#D32F2F",
                background: "#fff",
                onBackground: "#11181C",
                surface: "#F5F5F5",
                onSurface: "#11181C",
                outline: "#E0E0E0",
                surfaceVariant: "#EEEEEE",
                onSurfaceVariant: "#11181C",
            },
            version: 3,
            isV3: true,
        }),
        MD3LightTheme: {
            dark: false,
            colors: {
                primary: "#0a7ea4",
                secondary: "#7B1FA2",
                error: "#D32F2F",
                background: "#fff",
                onBackground: "#11181C",
                surface: "#F5F5F5",
                onSurface: "#11181C",
                outline: "#E0E0E0",
                surfaceVariant: "#EEEEEE",
                onSurfaceVariant: "#11181C",
            },
            version: 3,
            isV3: true,
        },
        MD3DarkTheme: {
            dark: true,
            colors: {
                primary: "#29B6F6",
                secondary: "#BA68C8",
                error: "#EF5350",
                background: "#151718",
                onBackground: "#ECEDEE",
                surface: "#2D2D2D",
                onSurface: "#ECEDEE",
                outline: "#424242",
                surfaceVariant: "#383838",
                onSurfaceVariant: "#ECEDEE",
            },
            version: 3,
            isV3: true,
        },
    };
});

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Additional Expo Features
// Mock expo-font
jest.mock("expo-font", () => ({
    isLoaded: jest.fn(() => true),
    loadAsync: jest.fn(),
    __internal: {
        loadedNativeFonts: [],
        getNativeFontName: jest.fn(),
        unloadAllAsync: jest.fn(),
        unloadAsync: jest.fn(),
    },
    Font: {
        isLoaded: jest.fn(() => true),
        loadAsync: jest.fn(),
    },
}));

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
    MaterialCommunityIcons: function Icon() {
        return null;
    },
    createIconSet: () =>
        function Icon() {
            return null;
        },
}));
