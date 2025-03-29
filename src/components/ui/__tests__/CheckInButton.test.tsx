import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { render } from "@/utils/test-utils";
import CheckInButton from "../CheckInButton";
import * as Location from "expo-location";
import zohoService from "@/services/api/zohoService";
import basecampService from "@/services/api/basecampService";

// Mock the external dependencies
jest.mock("expo-location");
jest.mock("@/services/api/zohoService");
jest.mock("@/services/api/basecampService");

describe("CheckInButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock implementations
        (
            Location.requestForegroundPermissionsAsync as jest.Mock
        ).mockResolvedValue({ status: "granted" });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 40.7128, longitude: -74.006 },
        });
        (zohoService.checkIn as jest.Mock).mockResolvedValue({});
        (basecampService.checkIn as jest.Mock).mockResolvedValue({});
    });

    it("renders correctly", () => {
        const { getByTestId } = render(<CheckInButton />);
        expect(getByTestId("check-in-container")).toBeTruthy();
        expect(getByTestId("check-in-button")).toBeTruthy();
    });

    it("handles successful check-in flow", async () => {
        const { getByTestId } = render(<CheckInButton />);
        const button = getByTestId("check-in-button");

        fireEvent.press(button);

        await waitFor(() => {
            expect(
                Location.requestForegroundPermissionsAsync
            ).toHaveBeenCalled();
            expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
            expect(zohoService.checkIn).toHaveBeenCalledWith("40.7128,-74.006");
            expect(basecampService.checkIn).toHaveBeenCalledWith(
                expect.stringContaining("Checked in at")
            );
        });
    });

    it("shows alert when location permission is denied", async () => {
        (
            Location.requestForegroundPermissionsAsync as jest.Mock
        ).mockResolvedValue({ status: "denied" });
        const alertMock = jest.spyOn(window, "alert").mockImplementation();

        const { getByTestId } = render(<CheckInButton />);
        const button = getByTestId("check-in-button");

        fireEvent.press(button);

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                "Location permission is required for check-in!"
            );
            expect(zohoService.checkIn).not.toHaveBeenCalled();
            expect(basecampService.checkIn).not.toHaveBeenCalled();
        });
    });

    it("handles API errors gracefully", async () => {
        (zohoService.checkIn as jest.Mock).mockRejectedValue(
            new Error("API Error")
        );
        const alertMock = jest.spyOn(window, "alert").mockImplementation();
        const consoleMock = jest.spyOn(console, "error").mockImplementation();

        const { getByTestId } = render(<CheckInButton />);
        const button = getByTestId("check-in-button");

        fireEvent.press(button);

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                "Failed to check in. Please try again."
            );
            expect(consoleMock).toHaveBeenCalledWith(
                "Check-in failed:",
                expect.any(Error)
            );
        });
    });

    it("disables button while loading", async () => {
        // Add artificial delay to check loading state
        (zohoService.checkIn as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const { getByTestId } = render(<CheckInButton />);
        const button = getByTestId("check-in-button");

        fireEvent.press(button);

        expect(button.props.disabled).toBe(true);

        await waitFor(() => {
            expect(button.props.disabled).toBe(false);
        });
    });
});
