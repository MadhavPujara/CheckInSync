import axios from "axios";
import settingsStorage from "./settingsStorage";

const ZOHO_API_BASE = "https://people.zoho.com/api/v1";

class ZohoService {
    private accessToken: string | null = null;

    private async getAccessToken() {
        if (this.accessToken) return this.accessToken;

        const keys = await settingsStorage.getZohoKeys();
        if (!keys)
            throw new Error(
                "Zoho API keys not found. Please complete setup first."
            );

        try {
            const response = await axios.post(
                "https://accounts.zoho.com/oauth/v2/token",
                null,
                {
                    params: {
                        refresh_token: keys.refreshToken,
                        client_id: keys.clientId,
                        client_secret: keys.clientSecret,
                        grant_type: "refresh_token",
                    },
                }
            );

            this.accessToken = response.data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error("Failed to get Zoho access token:", error);
            throw error;
        }
    }

    async checkIn(latitude: number, longitude: number) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                `${ZOHO_API_BASE}/attendance/checkin`,
                {
                    latitude,
                    longitude,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to check in:", error);
            throw error;
        }
    }
}

export default new ZohoService();
