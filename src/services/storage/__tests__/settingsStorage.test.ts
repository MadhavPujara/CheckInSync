import * as SecureStore from "expo-secure-store";
import settingsStorage from "../settingsStorage";

jest.mock("expo-secure-store");

describe("SettingsStorage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockZohoKeys = {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        refreshToken: "test-refresh-token",
        accessToken: "test-access-token",
    };

    const mockBasecampKeys = {
        accessToken: "test-access-token",
        accountId: "test-account-id",
        projectId: "test-project-id",
        campfireId: "test-campfire-id",
    };

    describe("setup status", () => {
        it("returns false when setup is not complete", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
            const result = await settingsStorage.isSetupComplete();
            expect(result).toBe(false);
        });

        it("returns true when setup is complete", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("true");
            const result = await settingsStorage.isSetupComplete();
            expect(result).toBe(true);
        });

        it("sets setup complete status", async () => {
            await settingsStorage.setSetupComplete(true);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "setup_complete",
                "true"
            );
        });

        it("handles errors when checking setup status", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
                new Error("Storage error")
            );
            const result = await settingsStorage.isSetupComplete();
            expect(result).toBe(false);
        });
    });

    describe("Zoho keys", () => {
        it("returns null when no keys are stored", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
            const result = await settingsStorage.getZohoKeys();
            expect(result).toBeNull();
        });

        it("returns stored Zoho keys", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
                JSON.stringify(mockZohoKeys)
            );
            const result = await settingsStorage.getZohoKeys();
            expect(result).toEqual(mockZohoKeys);
        });

        it("stores Zoho keys", async () => {
            await settingsStorage.setZohoKeys(mockZohoKeys);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "zoho_keys",
                JSON.stringify(mockZohoKeys)
            );
        });

        it("handles errors when retrieving Zoho keys", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
                new Error("Storage error")
            );
            const result = await settingsStorage.getZohoKeys();
            expect(result).toBeNull();
        });
    });

    describe("Basecamp keys", () => {
        it("returns null when no keys are stored", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
            const result = await settingsStorage.getBasecampKeys();
            expect(result).toBeNull();
        });

        it("returns stored Basecamp keys", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
                JSON.stringify(mockBasecampKeys)
            );
            const result = await settingsStorage.getBasecampKeys();
            expect(result).toEqual(mockBasecampKeys);
        });

        it("stores Basecamp keys", async () => {
            await settingsStorage.setBasecampKeys(mockBasecampKeys);
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "basecamp_keys",
                JSON.stringify(mockBasecampKeys)
            );
        });

        it("handles errors when retrieving Basecamp keys", async () => {
            (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(
                new Error("Storage error")
            );
            const result = await settingsStorage.getBasecampKeys();
            expect(result).toBeNull();
        });
    });

    describe("clearStorage", () => {
        it("clears all stored keys", async () => {
            await settingsStorage.clearStorage();
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
                "setup_complete"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
                "zoho_keys"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
                "basecamp_keys"
            );
        });
    });
});
