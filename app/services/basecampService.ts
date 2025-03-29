import axios from "axios";
import settingsStorage from "./settingsStorage";

const BASECAMP_API_BASE = "https://3.basecampapi.com";

class BasecampService {
    private async getHeaders() {
        const keys = await settingsStorage.getBasecampKeys();
        if (!keys)
            throw new Error(
                "Basecamp API keys not found. Please complete setup first."
            );

        return {
            Authorization: `Bearer ${keys.accessToken}`,
            "Content-Type": "application/json",
            "User-Agent": "Check-In Helper (your-email@example.com)",
        };
    }

    async sendCampfireMessage(message: string) {
        try {
            const keys = await settingsStorage.getBasecampKeys();
            if (!keys) throw new Error("Basecamp API keys not found");

            const response = await axios.post(
                `${BASECAMP_API_BASE}/${keys.accountId}/buckets/${keys.projectId}/chats/${keys.campfireId}/lines`,
                { content: message },
                { headers: await this.getHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error("Failed to send Basecamp message:", error);
            throw error;
        }
    }
}

export default new BasecampService();
