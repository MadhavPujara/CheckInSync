import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SettingsScreen from "@/components/screens/SettingsScreen";
import settingsStorage from "@/services/storage/settingsStorage";

// Mock the settings storage
jest.mock("@/services/storage/settingsStorage", () => ({
    getZohoKeys: jest.fn(),
    getBasecampKeys: jest.fn(),
    setZohoKeys: jest.fn(),
    setBasecampKeys: jest.fn(),
}));

// Mock the ThemeContext
jest.mock("@/theme/ThemeContext", () => ({
    useThemeContext: jest.fn().mockReturnValue({
        themePreference: "light",
        setThemePreference: jest.fn(),
    }),
}));

// Mock global alert
global.alert = jest.fn();

describe("SettingsScreen", () => {
    jest.useFakeTimers();

    // Test data
    const zohoKeys = {
        clientId: "test-client-id",
        clientSecret: "test-secret",
        refreshToken: "test-refresh",
        accessToken: "test-access",
    };

    const basecampKeys = {
        accessToken: "test-bc-token",
        accountId: "12345",
        projectId: "67890",
        campfireId: "camp123",
    };

    // Helper functions
    const fillFormWithTestData = (
        getByTestId: (testId: string) => HTMLElement
    ) => {
        fireEvent.changeText(
            getByTestId("zoho-client-id-input"),
            zohoKeys.clientId
        );
        fireEvent.changeText(
            getByTestId("zoho-client-secret-input"),
            zohoKeys.clientSecret
        );
        fireEvent.changeText(
            getByTestId("zoho-refresh-token-input"),
            zohoKeys.refreshToken
        );
        fireEvent.changeText(
            getByTestId("basecamp-access-token-input"),
            basecampKeys.accessToken
        );
        fireEvent.changeText(
            getByTestId("basecamp-account-id-input"),
            basecampKeys.accountId
        );
        fireEvent.changeText(
            getByTestId("basecamp-project-id-input"),
            basecampKeys.projectId
        );
        fireEvent.changeText(
            getByTestId("basecamp-campfire-id-input"),
            basecampKeys.campfireId
        );
    };

    const renderAndWaitForDataLoad = async () => {
        const renderResult = render(<SettingsScreen />);
        await renderResult.findByTestId("zoho-client-id-input");
        return renderResult;
    };

    const pressButtonWithinAct = async (
        getByTestId: (testId: string) => HTMLElement,
        buttonTestId = "save-button"
    ) => {
        return act(async () => {
            fireEvent.press(getByTestId(buttonTestId));
            jest.runAllTimers();
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementation
        (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValue(zohoKeys);
        (settingsStorage.getBasecampKeys as jest.Mock).mockResolvedValue(
            basecampKeys
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders all input fields correctly", async () => {
        const { getByTestId, findByDisplayValue } =
            await renderAndWaitForDataLoad();

        // Check headings and labels
        expect(getByTestId("settings-text")).toBeTruthy();
        expect(getByTestId("appearance-card")).toBeTruthy();
        expect(getByTestId("zoho-people-api-keys-card")).toBeTruthy();
        expect(getByTestId("basecamp-api-keys-card")).toBeTruthy();

        // Wait for data to load
        await findByDisplayValue(zohoKeys.clientId);
        await findByDisplayValue(basecampKeys.accessToken);
    });

    it("loads saved settings on mount", async () => {
        const { findByDisplayValue } = await renderAndWaitForDataLoad();

        // Check if all fields are populated with values from storage
        await findByDisplayValue(zohoKeys.clientId);
        await findByDisplayValue(zohoKeys.clientSecret);
        await findByDisplayValue(zohoKeys.refreshToken);
        await findByDisplayValue(basecampKeys.accessToken);
        await findByDisplayValue(basecampKeys.accountId);
        await findByDisplayValue(basecampKeys.projectId);
        await findByDisplayValue(basecampKeys.campfireId);

        // Verify storage was called
        expect(settingsStorage.getZohoKeys).toHaveBeenCalledTimes(1);
        expect(settingsStorage.getBasecampKeys).toHaveBeenCalledTimes(1);
    });

    it("updates input values when typing", async () => {
        const { getByTestId, findByDisplayValue } =
            await renderAndWaitForDataLoad();

        // Wait for data to load
        await findByDisplayValue(zohoKeys.clientId);

        // Update a Zoho input
        const clientIdInput = getByTestId("zoho-client-id-input");
        fireEvent.changeText(clientIdInput, "new-client-id");

        // Update a Basecamp input
        const accountIdInput = getByTestId("basecamp-account-id-input");
        fireEvent.changeText(accountIdInput, "new-account-id");

        // Verify the inputs were updated
        await findByDisplayValue("new-client-id");
        await findByDisplayValue("new-account-id");
    });

    it("saves settings when save button is pressed", async () => {
        const { getByTestId, findByTestId } = await renderAndWaitForDataLoad();

        // Wait for data to load
        await findByTestId("zoho-client-id-input");

        // Update inputs
        fireEvent.changeText(
            getByTestId("zoho-client-id-input"),
            "updated-client-id"
        );
        fireEvent.changeText(
            getByTestId("basecamp-project-id-input"),
            "updated-project-id"
        );

        // Press save button within act, run timers, and flush promises
        await pressButtonWithinAct(getByTestId);

        // Wait for saving to complete
        await waitFor(() => {
            expect(settingsStorage.setZohoKeys).toHaveBeenCalledWith(
                expect.objectContaining({ clientId: "updated-client-id" })
            );
            expect(settingsStorage.setBasecampKeys).toHaveBeenCalledWith(
                expect.objectContaining({ projectId: "updated-project-id" })
            );
        });
    });

    it("shows success alert after saving", async () => {
        const { getByTestId } = await renderAndWaitForDataLoad();

        // Fill form with test data
        fillFormWithTestData(getByTestId);

        // Press save button
        await pressButtonWithinAct(getByTestId);

        // Check global alert
        expect(global.alert).toHaveBeenCalledWith(
            "Settings updated successfully!"
        );
    });

    it("handles error when saving fails", async () => {
        // Mock storage to throw an error
        (settingsStorage.setZohoKeys as jest.Mock).mockRejectedValue(
            new Error("Save failed")
        );

        const { getByTestId } = await renderAndWaitForDataLoad();

        // Fill form with test data
        fillFormWithTestData(getByTestId);

        // Mock console.error
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        // Press save button
        await pressButtonWithinAct(getByTestId);

        // Check alert call
        expect(global.alert).toHaveBeenCalledWith(
            "Failed to save settings. Please try again."
        );

        consoleSpy.mockRestore();
    });

    it("disables save button when fields are empty", async () => {
        // Mock empty values
        (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValue({
            clientId: "",
            clientSecret: "",
            refreshToken: "",
            accessToken: "",
        });

        (settingsStorage.getBasecampKeys as jest.Mock).mockResolvedValue({
            accessToken: "",
            accountId: "",
            projectId: "",
            campfireId: "",
        });

        const { getByTestId } = await renderAndWaitForDataLoad();

        // Check if save button is disabled
        await waitFor(() => {
            const saveButton = getByTestId("save-button");
            expect(saveButton).toBeDisabled();
        });
    });

    it("disables save button when fields are cleared", async () => {
        // Mock values (can be non-empty initially for this test)
        (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValue({
            clientId: "initial-client",
            clientSecret: "initial-secret",
            refreshToken: "initial-refresh",
            accessToken: "initial-zoho-token",
        });
        (settingsStorage.getBasecampKeys as jest.Mock).mockResolvedValue({
            accessToken: "initial-bc-token",
            accountId: "initial-acc",
            projectId: "initial-proj",
            campfireId: "initial-cf",
        });

        const { findByTestId, getByTestId } = await renderAndWaitForDataLoad();

        // Wait for initial load by finding an input via testID
        const clientIdInput = await findByTestId("zoho-client-id-input");

        // Ensure the input has the initial value (confirms loading finished)
        expect(clientIdInput.props.value).toBe("initial-client");

        // Clear the input field within act
        await act(async () => {
            fireEvent.changeText(getByTestId("zoho-client-id-input"), "");
            jest.runAllTimers();
        });

        // Check if save button is disabled using testID and the correct matcher
        const saveButton = await findByTestId("save-button");
        expect(saveButton).toBeDisabled();
    });
});
