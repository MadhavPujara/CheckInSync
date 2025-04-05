import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import SetupScreen from "@/components/screens/SetupScreen";
import settingsStorage from "@/services/storage/settingsStorage";

// Mock the settings storage
jest.mock("@/services/storage/settingsStorage", () => ({
    setZohoKeys: jest.fn().mockResolvedValue(undefined),
    setBasecampKeys: jest.fn().mockResolvedValue(undefined),
    setSetupComplete: jest.fn().mockResolvedValue(undefined),
}));

// Mock the Alert module (keeps module mock too, just in case)
jest.mock("react-native/Libraries/Alert/Alert", () => ({
    alert: jest.fn(),
}));

// Mock the global alert function
global.alert = jest.fn();

describe("SetupScreen", () => {
    // Enable fake timers for this test suite
    jest.useFakeTimers();

    const mockOnSetupComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Also clear the global alert mock
        (global.alert as jest.Mock).mockClear();
    });

    it("renders all input fields correctly", () => {
        const { getByText, getByTestId } = render(
            <SetupScreen onSetupComplete={mockOnSetupComplete} />
        );

        // Check headings
        expect(getByText("First-time Setup")).toBeTruthy();
        expect(getByText("Zoho People API Keys")).toBeTruthy();
        expect(getByText("Basecamp API Keys")).toBeTruthy();

        // Check input fields using testID
        expect(getByTestId("zoho-client-id-input")).toBeTruthy();
        expect(getByTestId("zoho-client-secret-input")).toBeTruthy();
        expect(getByTestId("zoho-refresh-token-input")).toBeTruthy();
        expect(getByTestId("zoho-access-token-input")).toBeTruthy();
        expect(getByTestId("basecamp-access-token-input")).toBeTruthy();
        expect(getByTestId("basecamp-account-id-input")).toBeTruthy();
        expect(getByTestId("basecamp-project-id-input")).toBeTruthy();
        expect(getByTestId("basecamp-campfire-id-input")).toBeTruthy();
    });

    it("updates input values when typing", () => {
        const { getByTestId } = render(
            <SetupScreen onSetupComplete={mockOnSetupComplete} />
        );

        // Update Zoho inputs using testID
        const clientIdInput = getByTestId("zoho-client-id-input");
        fireEvent.changeText(clientIdInput, "test-client-id");
        expect(clientIdInput.props.value).toBe("test-client-id");

        // Update Basecamp inputs using testID
        const accountIdInput = getByTestId("basecamp-account-id-input");
        fireEvent.changeText(accountIdInput, "test-account-id");
        expect(accountIdInput.props.value).toBe("test-account-id");
    });

    it("disables save button when fields are empty", () => {
        const { getByTestId } = render(
            <SetupScreen onSetupComplete={mockOnSetupComplete} />
        );

        // Target button by testID and check its 'disabled' prop
        const completeButton = getByTestId("complete-setup-button");
        expect(completeButton).toBeDisabled();
    });

    it("enables save button when all fields are filled", () => {
        const { getByTestId } = render(
            <SetupScreen onSetupComplete={mockOnSetupComplete} />
        );

        // Fill in all required fields using testID
        const inputTestIds = [
            "zoho-client-id-input",
            "zoho-client-secret-input",
            "zoho-refresh-token-input",
            "zoho-access-token-input",
            "basecamp-access-token-input",
            "basecamp-account-id-input",
            "basecamp-project-id-input",
            "basecamp-campfire-id-input",
        ];

        inputTestIds.forEach((testId) => {
            const input = getByTestId(testId);
            fireEvent.changeText(input, `test-${testId}`);
        });

        // Target button by testID and check its 'disabled' prop
        const completeButton = getByTestId("complete-setup-button");
        expect(completeButton).toBeEnabled();
    });

    it("saves settings and calls onSetupComplete when setup is completed", async () => {
        const { getByTestId } = render(
            <SetupScreen onSetupComplete={mockOnSetupComplete} />
        );

        // Fill in all required fields using testID
        fireEvent.changeText(getByTestId("zoho-client-id-input"), "client-id");
        fireEvent.changeText(
            getByTestId("zoho-client-secret-input"),
            "client-secret"
        );
        fireEvent.changeText(
            getByTestId("zoho-refresh-token-input"),
            "refresh-token"
        );
        fireEvent.changeText(
            getByTestId("zoho-access-token-input"),
            "zoho-access-token"
        ); // Use distinct value
        fireEvent.changeText(
            getByTestId("basecamp-access-token-input"),
            "basecamp-access-token"
        ); // Use distinct value
        fireEvent.changeText(
            getByTestId("basecamp-account-id-input"),
            "account-id"
        );
        fireEvent.changeText(
            getByTestId("basecamp-project-id-input"),
            "project-id"
        );
        fireEvent.changeText(
            getByTestId("basecamp-campfire-id-input"),
            "campfire-id"
        );

        // Press the button within act and run timers immediately after
        await act(async () => {
            await fireEvent.press(getByTestId("complete-setup-button"));
            // Run timers *inside* this act block
            jest.runAllTimers();
        });

        // Wait for async assertions
        await waitFor(() => {
            // Verify settings were saved
            expect(settingsStorage.setZohoKeys).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientId: "client-id",
                    clientSecret: "client-secret",
                    refreshToken: "refresh-token",
                    accessToken: "zoho-access-token", // Check distinct value
                })
            );

            expect(settingsStorage.setBasecampKeys).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessToken: "basecamp-access-token", // Check distinct value
                    accountId: "account-id",
                    projectId: "project-id",
                    campfireId: "campfire-id",
                })
            );

            expect(settingsStorage.setSetupComplete).toHaveBeenCalledWith(true);
            expect(mockOnSetupComplete).toHaveBeenCalled();
        });
    });

    it("handles errors when saving fails", async () => {
        // Mock storage to throw an error
        (settingsStorage.setZohoKeys as jest.Mock).mockRejectedValue(
            new Error("Save failed")
        );

        const { getByTestId } = render(
            <SetupScreen onSetupComplete={mockOnSetupComplete} />
        );

        // Fill in all required fields using testID
        fireEvent.changeText(getByTestId("zoho-client-id-input"), "client-id");
        fireEvent.changeText(
            getByTestId("zoho-client-secret-input"),
            "client-secret"
        );
        fireEvent.changeText(
            getByTestId("zoho-refresh-token-input"),
            "refresh-token"
        );
        fireEvent.changeText(
            getByTestId("zoho-access-token-input"),
            "zoho-access-token"
        );
        fireEvent.changeText(
            getByTestId("basecamp-access-token-input"),
            "basecamp-access-token"
        );
        fireEvent.changeText(
            getByTestId("basecamp-account-id-input"),
            "account-id"
        );
        fireEvent.changeText(
            getByTestId("basecamp-project-id-input"),
            "project-id"
        );
        fireEvent.changeText(
            getByTestId("basecamp-campfire-id-input"),
            "campfire-id"
        );

        // Mock console.error to prevent log noise
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        // Press the button within act and run timers immediately after
        await act(async () => {
            await fireEvent.press(getByTestId("complete-setup-button"));
            // Run timers *inside* this act block
            jest.runAllTimers();
        });

        // Wait for async assertions
        await waitFor(() => {
            // Check if the GLOBAL alert was called
            expect(global.alert).toHaveBeenCalledWith(
                "Failed to save settings. Please try again."
            );

            // Verify onSetupComplete was not called
            expect(mockOnSetupComplete).not.toHaveBeenCalled();
        });

        // Restore the spy *after* waitFor has completed or timed out
        consoleSpy.mockRestore();
    });
});
