import * as React from "react";
import renderer, { type ReactTestRenderer } from "react-test-renderer";
import ThemedText from "@/components/ThemedText";
import { useColorScheme } from "react-native";

// Mock the theme related imports
jest.mock("@/theme/index", () => ({
    __esModule: true,
    Colors: {
        light: {
            text: "#000000",
            background: "#ffffff",
        },
        dark: {
            text: "#ffffff",
            background: "#000000",
        },
    },
    default: {
        Colors: {
            light: {
                text: "#000000",
                background: "#ffffff",
            },
            dark: {
                text: "#ffffff",
                background: "#000000",
            },
        },
    },
}));

// Mock the useThemeColor hook to return predictable colors
jest.mock("@/hooks/useThemeColor", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((props, colorName) => {
        return props?.light || "#000000";
    }),
}));

// Mock the useColorScheme hook with a variable we can change
const mockColorScheme = jest.fn().mockReturnValue("light");
jest.mock("react-native", () => ({
    ...jest.requireActual("react-native"),
    useColorScheme: () => mockColorScheme(),
}));

describe("ThemedText", () => {
    let testRenderer: ReactTestRenderer;

    afterEach(() => {
        testRenderer?.unmount();
        jest.clearAllMocks();
    });

    it("renders default text correctly", () => {
        testRenderer = renderer.create(<ThemedText>Default text</ThemedText>);
        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("renders title text correctly", () => {
        testRenderer = renderer.create(
            <ThemedText type="title">Title text</ThemedText>
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("renders subtitle text correctly", () => {
        testRenderer = renderer.create(
            <ThemedText type="subtitle">Subtitle text</ThemedText>
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("renders link text correctly", () => {
        testRenderer = renderer.create(
            <ThemedText type="link">Link text</ThemedText>
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
    });

    it("applies custom colors correctly", () => {
        testRenderer = renderer.create(
            <ThemedText lightColor="#ff0000" darkColor="#00ff00">
                Colored text
            </ThemedText>
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
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

        testRenderer = renderer.create(
            <ThemedText>Dark theme text</ThemedText>
        );
        expect(testRenderer.toJSON()).toMatchSnapshot();
    });
});
