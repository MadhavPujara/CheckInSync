import * as React from "react";
import { render, cleanup } from "@testing-library/react-native";
import ThemedText from "@/components/ThemedText";

// Mock the useThemeColor hook to return predictable colors
jest.mock("@/hooks/useThemeColor", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((props, colorName) => {
        return props?.light || "#000000";
    }),
}));

// Mock the useColorScheme hook with a variable we can change
const mockColorScheme = jest.fn().mockReturnValue("light");

describe("ThemedText", () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it("renders default text correctly", () => {
        const { toJSON } = render(<ThemedText>Default text</ThemedText>);
        expect(toJSON()).toMatchSnapshot();
    });

    it("renders title text correctly", () => {
        const { toJSON } = render(
            <ThemedText type="title">Title text</ThemedText>
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("renders subtitle text correctly", () => {
        const { toJSON } = render(
            <ThemedText type="subtitle">Subtitle text</ThemedText>
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("renders link text correctly", () => {
        const { toJSON } = render(
            <ThemedText type="link">Link text</ThemedText>
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("applies custom colors correctly", () => {
        const { toJSON } = render(
            <ThemedText lightColor="#ff0000" darkColor="#00ff00">
                Colored text
            </ThemedText>
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("respects dark theme", () => {
        // Update the mock for this test
        mockColorScheme.mockReturnValue("dark");

        // Also update the useThemeColor mock for dark theme
        const useThemeColor = require("@/hooks/useThemeColor").default;
        useThemeColor.mockImplementationOnce(
            (props: { light?: string; dark?: string }, colorName: string) => {
                return props?.dark || "#ffffff";
            }
        );

        const { toJSON } = render(<ThemedText>Dark theme text</ThemedText>);
        expect(toJSON()).toMatchSnapshot();
    });
});
