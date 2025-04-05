import React from "react";
import {
    render as rtlRender,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react-native";
import CheckInButton from "@/components/ui/CheckInButton";
import * as Location from "expo-location";
import { zohoService, basecampService } from "@/services/index";

// Mock the central service index file
jest.mock("@/services", () => ({
    zohoService: {
        checkIn: jest.fn(),
    },
    basecampService: {
        checkIn: jest.fn(),
    },
}));

// Mock expo-location
jest.mock("expo-location");

describe("CheckInButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default mock implementations for the methods on the mocked objects
        (
            Location.requestForegroundPermissionsAsync as jest.Mock
        ).mockResolvedValue({ status: "granted" });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 40.7128, longitude: -74.006 },
        });
        // Reset mocks on the imported service objects
        (basecampService.checkIn as jest.Mock).mockResolvedValue({});
        (zohoService.checkIn as jest.Mock).mockResolvedValue({});
        // Restore alert mock
        global.alert = jest.fn();
    });

    it("renders correctly", () => {
        const { getByTestId } = rtlRender(<CheckInButton />);
        expect(getByTestId("check-in-container")).toBeTruthy();
        expect(getByTestId("check-in-button")).toBeTruthy();
    });

    it("handles successful check-in flow", async () => {
        const { getByTestId } = rtlRender(<CheckInButton />);
        const button = getByTestId("check-in-button");

        await act(async () => {
            fireEvent.press(button);
        });

        await waitFor(() => {
            expect(
                Location.requestForegroundPermissionsAsync
            ).toHaveBeenCalled();
            expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
            expect(zohoService.checkIn).toHaveBeenCalledWith("40.7128,-74.006");
            expect(basecampService.checkIn).toHaveBeenCalledWith(
                "Good Morning"
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

        const { getByTestId } = rtlRender(<CheckInButton />);
        const button = getByTestId("check-in-button");

        await act(async () => {
            fireEvent.press(button);
        });

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

        const { getByTestId } = rtlRender(<CheckInButton />);
        const button = getByTestId("check-in-button");

        await act(async () => {
            fireEvent.press(button);
        });

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith(
                "Failed to check in. Please try again."
            );
            expect(consoleMock).toHaveBeenCalledWith(
                "Check-in failed:",
                expect.any(Error)
            );
        });
        // Restore console mock after test
        consoleMock.mockRestore();
    });

    it("disables button while loading", async () => {
        // Mock zohoService.checkIn from the imported mocked object
        let resolveZohoCheckIn: (value: any) => void;
        const zohoCheckInPromise = new Promise((resolve) => {
            resolveZohoCheckIn = resolve;
        });
        (zohoService.checkIn as jest.Mock).mockImplementation(
            () => zohoCheckInPromise
        );

        const { getByTestId } = rtlRender(<CheckInButton />);
        const button = getByTestId("check-in-button");

        // First press - button should become disabled during the API call
        await act(async () => {
            fireEvent.press(button);
        });

        // Check that the loading state has been set
        expect(button.props.accessibilityState?.disabled).toBe(true);

        // Try to press again while loading
        await act(async () => {
            fireEvent.press(button);
        });

        // Verify that the APIs were only called once
        expect(
            Location.requestForegroundPermissionsAsync
        ).toHaveBeenCalledTimes(1);

        // Resolve the promise to complete the loading state
        await act(async () => {
            resolveZohoCheckIn({});
        });

        // Wait for the loading state to be updated
        await waitFor(() => {
            expect(button.props.accessibilityState?.disabled).toBe(false);
        });
    });
});
