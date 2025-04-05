// jest.setup.ts
import "@testing-library/jest-native/extend-expect";

// Enable fake timers globally for all tests
jest.useFakeTimers();

// Mock expo-font with basic implementations
jest.mock("expo-font", () => ({
    ...jest.requireActual("expo-font"), // Keep original non-problematic exports
    loadAsync: jest.fn().mockResolvedValue(undefined), // Mock font loading
    isLoaded: jest.fn().mockReturnValue(true), // Assume fonts are loaded
    useFonts: jest.fn().mockReturnValue([true, null]), // Mock the hook if used
    // Add other functions if tests complain about them being missing
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: jest
            .fn()
            .mockImplementation(({ children }) => children),
        SafeAreaConsumer: jest
            .fn()
            .mockImplementation(({ children }) => children(inset)),
        useSafeAreaInsets: jest.fn().mockReturnValue(inset),
        useSafeAreaFrame: jest
            .fn()
            .mockReturnValue({ x: 0, y: 0, width: 390, height: 844 }),
    };
});

// Mock global alert
global.alert = jest.fn();
