import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Header from "@/components/ui/Header";

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("react-native-paper", () => {
    const { View, TouchableOpacity, Text } = require("react-native");
    return {
        Appbar: {
            Header: ({
                children,
                testID,
            }: {
                children: React.ReactNode;
                testID?: string;
            }) => <View testID={testID || "header-container"}>{children}</View>,
            Action: ({
                icon,
                onPress,
                testID,
            }: {
                icon: string;
                onPress: () => void;
                testID?: string;
            }) => (
                <TouchableOpacity testID={testID} onPress={onPress}>
                    <Text>{icon}</Text>
                </TouchableOpacity>
            ),
            Content: ({
                title,
                testID,
            }: {
                title: string;
                testID?: string;
            }) => <Text testID={testID}>{title}</Text>,
        },
    };
});

describe("Header", () => {
    it("renders correctly", () => {
        const mockOnMenuPress = jest.fn();
        const { getByTestId, getByText } = render(
            <Header onMenuPress={mockOnMenuPress} />
        );

        // Check if main components exist
        expect(getByTestId("header-container")).toBeTruthy();
        expect(getByTestId("menu-button")).toBeTruthy();
        expect(getByTestId("header-title")).toBeTruthy();

        // Check if title is shown
        expect(getByText("Check-in Helper")).toBeTruthy();
    });

    it("calls onMenuPress when menu button is pressed", () => {
        const mockOnMenuPress = jest.fn();
        const { getByTestId } = render(
            <Header onMenuPress={mockOnMenuPress} />
        );

        // Find and press the menu button
        const menuButton = getByTestId("menu-button");
        fireEvent.press(menuButton);

        // Verify callback was called
        expect(mockOnMenuPress).toHaveBeenCalledTimes(1);
    });

    it("matches snapshot", () => {
        const mockOnMenuPress = jest.fn();
        const { toJSON } = render(<Header onMenuPress={mockOnMenuPress} />);

        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});
