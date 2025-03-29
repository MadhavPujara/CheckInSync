import React from "react";
import { fireEvent } from "@testing-library/react-native";
import { render } from "@/utils/test-utils";
import Header from "../Header";

describe("Header", () => {
    it("renders correctly", () => {
        const onMenuPress = jest.fn();
        const { getByTestId, getByText } = render(
            <Header onMenuPress={onMenuPress} />
        );

        expect(getByTestId("header-container")).toBeTruthy();
        expect(getByText("Check-in Helper")).toBeTruthy();
    });

    it("calls onMenuPress when menu button is pressed", () => {
        const onMenuPress = jest.fn();
        const { getByTestId } = render(<Header onMenuPress={onMenuPress} />);

        fireEvent.press(getByTestId("menu-button"));
        expect(onMenuPress).toHaveBeenCalledTimes(1);
    });
});
