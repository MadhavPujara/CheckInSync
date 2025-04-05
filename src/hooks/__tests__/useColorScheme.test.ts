import { renderHook } from "@testing-library/react-native";
import { useColorScheme as useNativeColorScheme } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";

// Mock the native useColorScheme hook
jest.mock("react-native", () => ({
    useColorScheme: jest.fn(),
}));

describe("useColorScheme", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns light when native hook returns light", () => {
        // Mock the native hook to return light
        (useNativeColorScheme as jest.Mock).mockReturnValue("light");

        // Render our hook
        const { result } = renderHook(() => useColorScheme());

        // Should return light
        expect(result.current).toBe("light");
    });

    it("returns dark when native hook returns dark", () => {
        // Mock the native hook to return dark
        (useNativeColorScheme as jest.Mock).mockReturnValue("dark");

        // Render our hook
        const { result } = renderHook(() => useColorScheme());

        // Should return dark
        expect(result.current).toBe("dark");
    });

    it("defaults to light when native hook returns null", () => {
        // Mock the native hook to return null
        (useNativeColorScheme as jest.Mock).mockReturnValue(null);

        // Render our hook
        const { result } = renderHook(() => useColorScheme());

        // Should default to light
        expect(result.current).toBe("light");
    });

    it("defaults to light when native hook returns undefined", () => {
        // Mock the native hook to return undefined
        (useNativeColorScheme as jest.Mock).mockReturnValue(undefined);

        // Render our hook
        const { result } = renderHook(() => useColorScheme());

        // Should default to light
        expect(result.current).toBe("light");
    });
});
