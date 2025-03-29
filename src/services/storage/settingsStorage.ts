import * as SecureStore from "expo-secure-store";

const KEYS = {
    SETUP_COMPLETE: "setup_complete",
    ZOHO_KEYS: "zoho_keys",
    BASECAMP_KEYS: "basecamp_keys",
};

export interface ZohoKeys {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken: string;
}

export interface BasecampKeys {
    accessToken: string;
    accountId: string;
    projectId: string;
    campfireId: string;
}

class SettingsStorage {
    async isSetupComplete(): Promise<boolean> {
        try {
            const value = await SecureStore.getItemAsync(KEYS.SETUP_COMPLETE);
            return value === "true";
        } catch {
            return false;
        }
    }

    async setSetupComplete(complete: boolean): Promise<void> {
        await SecureStore.setItemAsync(
            KEYS.SETUP_COMPLETE,
            complete.toString()
        );
    }

    async getZohoKeys(): Promise<ZohoKeys | null> {
        try {
            const value = await SecureStore.getItemAsync(KEYS.ZOHO_KEYS);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    }

    async setZohoKeys(keys: ZohoKeys): Promise<void> {
        await SecureStore.setItemAsync(KEYS.ZOHO_KEYS, JSON.stringify(keys));
    }

    async getBasecampKeys(): Promise<BasecampKeys | null> {
        try {
            const value = await SecureStore.getItemAsync(KEYS.BASECAMP_KEYS);
            return value ? JSON.parse(value) : null;
        } catch {
            return null;
        }
    }

    async setBasecampKeys(keys: BasecampKeys): Promise<void> {
        await SecureStore.setItemAsync(
            KEYS.BASECAMP_KEYS,
            JSON.stringify(keys)
        );
    }

    async clearStorage(): Promise<void> {
        await Promise.all([
            SecureStore.deleteItemAsync(KEYS.SETUP_COMPLETE),
            SecureStore.deleteItemAsync(KEYS.ZOHO_KEYS),
            SecureStore.deleteItemAsync(KEYS.BASECAMP_KEYS),
        ]);
    }
}

export default new SettingsStorage();
