import * as React from "react";
import { render, cleanup } from "@testing-library/react-native";
import ThemedView from "@/components/ThemedView";

// Mock the useThemeColor hook to return predictable colors
jest.mock("@/hooks/useThemeColor", () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((props, colorName) => {
        return props?.light || "#f0f0f0";
    }),
}));

describe("ThemedView", () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it("renders with default background color", () => {
        const { toJSON } = render(<ThemedView />);
        expect(toJSON()).toMatchSnapshot();
    });

    it("applies custom light color correctly", () => {
        const { toJSON } = render(<ThemedView lightColor="#ff0000" />);
        expect(toJSON()).toMatchSnapshot();
    });

    it("applies custom dark color correctly", () => {
        // Update the useThemeColor mock to return dark theme value
        const useThemeColor = require("@/hooks/useThemeColor").default;
        useThemeColor.mockImplementationOnce(
            (props: { light?: string; dark?: string }, colorName: string) => {
                return props?.dark || "#303030";
            }
        );

        const { toJSON } = render(<ThemedView darkColor="#00ff00" />);
        expect(toJSON()).toMatchSnapshot();
    });

    it("passes additional props correctly", () => {
        const { toJSON } = render(
            <ThemedView testID="test-view" accessibilityLabel="Test View" />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("applies custom styles correctly", () => {
        const { toJSON } = render(
            <ThemedView
                style={{
                    margin: 10,
                    padding: 20,
                    borderRadius: 5,
                }}
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });

    it("combines background color with custom styles", () => {
        const { toJSON } = render(
            <ThemedView
                lightColor="#ff5500"
                style={{
                    margin: 10,
                    padding: 20,
                }}
            />
        );
        expect(toJSON()).toMatchSnapshot();
    });
});
