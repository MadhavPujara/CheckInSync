import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { render } from "@/utils/test-utils";
import CheckInButton from "@/components/ui/CheckInButton";
import * as Location from "expo-location";
import zohoService from "@/services/api/zohoService";
import basecampService from "@/services/api/basecampService";

// Mock the external dependencies
jest.mock("@/services/api/zohoService");
jest.mock("@/services/api/basecampService");

describe.skip("CheckInButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock implementations
        (
            Location.requestForegroundPermissionsAsync as jest.Mock
        ).mockResolvedValue({ status: "granted" });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 40.7128, longitude: -74.006 },
        });
        (basecampService.checkIn as jest.Mock).mockResolvedValue({});
        // Restore alert mock
        global.alert = jest.fn();
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
            expect(global.alert).toHaveBeenCalledWith(
                "Successfully checked in and notified team!"
            );
        });
    });

    it("shows alert when location permission is denied", async () => {
        (
            Location.requestForegroundPermissionsAsync as jest.Mock
        ).mockResolvedValue({ status: "denied" });

        const { getByTestId } = render(<CheckInButton />);
        const button = getByTestId("check-in-button");

        fireEvent.press(button);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(
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
        const consoleMock = jest.spyOn(console, "error").mockImplementation();

        const { getByTestId } = render(<CheckInButton />);
        const button = getByTestId("check-in-button");

        fireEvent.press(button);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(
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

        // Try to press again while loading
        fireEvent.press(button);

        // Verify that the second press didn't trigger another check-in
        await waitFor(() => {
            expect(zohoService.checkIn).toHaveBeenCalledTimes(1);
        });
    });
});
