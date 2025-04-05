import { renderHook } from "@testing-library/react-native";
import useThemeColor from "@/hooks/useThemeColor";
import { Colors } from "@/theme/index";

// Mock the useColorScheme hook
jest.mock("@/hooks/useColorScheme", () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe("useThemeColor", () => {
    const useColorScheme = require("@/hooks/useColorScheme").default;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns light theme color when theme is light", () => {
        // Mock useColorScheme to return light
        useColorScheme.mockReturnValue("light");

        // Test with a color name from the theme
        const { result } = renderHook(() => useThemeColor({}, "text"));

        // Should return the light theme color for text
        expect(result.current).toBe(Colors.light.text);
    });

    it("returns dark theme color when theme is dark", () => {
        // Mock useColorScheme to return dark
        useColorScheme.mockReturnValue("dark");

        // Test with a color name from the theme
        const { result } = renderHook(() => useThemeColor({}, "text"));

        // Should return the dark theme color for text
        expect(result.current).toBe(Colors.dark.text);
    });

    it("returns light theme color when useColorScheme returns null", () => {
        // Mock useColorScheme to return null (should default to light)
        useColorScheme.mockReturnValue(null);

        // Test with a color name from the theme
        const { result } = renderHook(() => useThemeColor({}, "text"));

        // Should default to light theme color
        expect(result.current).toBe(Colors.light.text);
    });

    it("prefers custom light color when available in light theme", () => {
        // Mock useColorScheme to return light
        useColorScheme.mockReturnValue("light");

        // Test with custom color props
        const customProps = {
            light: "#ff0000",
            dark: "#00ff00",
        };

        const { result } = renderHook(() => useThemeColor(customProps, "text"));

        // Should return the custom light color
        expect(result.current).toBe("#ff0000");
    });

    it("prefers custom dark color when available in dark theme", () => {
        // Mock useColorScheme to return dark
        useColorScheme.mockReturnValue("dark");

        // Test with custom color props
        const customProps = {
            light: "#ff0000",
            dark: "#00ff00",
        };

        const { result } = renderHook(() => useThemeColor(customProps, "text"));

        // Should return the custom dark color
        expect(result.current).toBe("#00ff00");
    });

    it("works with different theme properties", () => {
        // Mock useColorScheme to return light
        useColorScheme.mockReturnValue("light");

        // Test with different theme color names
        const colorNames: (keyof typeof Colors.light)[] = [
            "text",
            "background",
            "tint",
        ];

        colorNames.forEach((colorName) => {
            const { result } = renderHook(() => useThemeColor({}, colorName));
            expect(result.current).toBe(Colors.light[colorName]);
        });
    });
});
