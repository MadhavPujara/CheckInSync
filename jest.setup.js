import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock expo-location
jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

// Mock window.alert
global.alert = jest.fn();

// Mock console.error
global.console.error = jest.fn();

// Mock asset requires
jest.mock("missing-asset-registry-path", () => "asset-mock", { virtual: true });

// Mock React Native components
jest.mock("react-native", () => {
    const React = require("react");
    return {
        Platform: { select: jest.fn((obj) => obj.default) },
        StyleSheet: {
            create: (styles) => styles,
            compose: jest.fn(),
            flatten: (style) => {
                if (Array.isArray(style)) {
                    return Object.assign({}, ...style);
                }
                return style || {};
            },
        },
        View: ({ children, testID, style, ...props }) =>
            React.createElement("view", { testID, style, ...props }, children),
        Text: ({ children, testID, style, ...props }) =>
            React.createElement("text", { testID, style, ...props }, children),
        TouchableOpacity: ({ children, testID, style, onPress, ...props }) =>
            React.createElement(
                "button",
                { testID, style, onPress, ...props },
                children
            ),
        useColorScheme: () => "light",
    };
});

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock React Native Paper components
jest.mock("react-native-paper", () => {
    const React = require("react");
    const MockedModule = {
        Appbar: {
            Header: ({ children, testID, style, ...props }) =>
                React.createElement(
                    "view",
                    { testID, style, ...props },
                    children
                ),
            Action: ({ onPress, testID, icon, ...props }) =>
                React.createElement("button", {
                    onPress,
                    testID,
                    "data-icon": icon,
                    ...props,
                }),
            Content: ({ title, testID, ...props }) =>
                React.createElement("text", { testID, ...props }, title),
        },
        Button: ({
            onPress,
            children,
            testID,
            mode,
            disabled,
            loading,
            style,
            contentStyle,
            ...props
        }) =>
            React.createElement(
                "button",
                {
                    onPress,
                    testID,
                    disabled,
                    "data-loading": loading,
                    "data-mode": mode,
                    style: { ...style },
                    "data-content-style": contentStyle,
                    ...props,
                },
                children
            ),
        MD3LightTheme: {},
        PaperProvider: ({ children, theme }) =>
            React.createElement("provider", { "data-theme": theme }, children),
    };
    return MockedModule;
});
