import BaseAPIService from "@/services/api/baseService";
import settingsStorage from "@/services/storage/settingsStorage";
import Errors from "@/services/api/errors";
import { BasecampService } from "@/utils/types/services";

const BASECAMP_API_BASE = "https://3.basecampapi.com";

interface BasecampKeys {
    accessToken: string;
    accountId: string;
    projectId: string;
}

interface MessageResponse {
    id: number;
    status: string;
    content: string;
}

class BasecampServiceImpl extends BaseAPIService implements BasecampService {
    constructor() {
        super(BASECAMP_API_BASE);
    }

    private async getHeaders(): Promise<{
        Authorization: string;
        "Content-Type": string;
    }> {
        const keys = await settingsStorage.getBasecampKeys();
        if (!keys?.accessToken) {
            throw new Errors.ValidationError("Basecamp API keys not found");
        }
        return {
            Authorization: `Bearer ${keys.accessToken}`,
            "Content-Type": "application/json",
        };
    }

    async checkIn(message: string): Promise<void> {
        const headers = await this.getHeaders();
        const keys = await settingsStorage.getBasecampKeys();
        if (!keys?.accountId || !keys?.projectId) {
            throw new Errors.ValidationError(
                "Basecamp project configuration not found"
            );
        }

        await this.request<MessageResponse>({
            method: "POST",
            url: `/${keys.accountId}/projects/${keys.projectId}/messages.json`,
            headers,
            data: { content: message },
        });
    }

    async validateCredentials(): Promise<boolean> {
        try {
            const headers = await this.getHeaders();
            await this.request({
                method: "GET",
                url: "/authorization.json",
                headers,
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}

export default BasecampServiceImpl;
