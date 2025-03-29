import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
    SETUP_COMPLETE: "setup_complete",
    ZOHO_KEYS: "zoho_keys",
    BASECAMP_KEYS: "basecamp_keys",
};

export interface ZohoKeys {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
}

export interface BasecampKeys {
    accessToken: string;
    accountId: string;
    projectId: string;
    campfireId: string;
}

class SettingsStorage {
    async isSetupComplete(): Promise<boolean> {
        const value = await AsyncStorage.getItem(KEYS.SETUP_COMPLETE);
        return value === "true";
    }

    async setSetupComplete(complete: boolean): Promise<void> {
        await AsyncStorage.setItem(KEYS.SETUP_COMPLETE, complete.toString());
    }

    async getZohoKeys(): Promise<ZohoKeys | null> {
        const value = await AsyncStorage.getItem(KEYS.ZOHO_KEYS);
        return value ? JSON.parse(value) : null;
    }

    async setZohoKeys(keys: ZohoKeys): Promise<void> {
        await AsyncStorage.setItem(KEYS.ZOHO_KEYS, JSON.stringify(keys));
    }

    async getBasecampKeys(): Promise<BasecampKeys | null> {
        const value = await AsyncStorage.getItem(KEYS.BASECAMP_KEYS);
        return value ? JSON.parse(value) : null;
    }

    async setBasecampKeys(keys: BasecampKeys): Promise<void> {
        await AsyncStorage.setItem(KEYS.BASECAMP_KEYS, JSON.stringify(keys));
    }
}

export default new SettingsStorage();
