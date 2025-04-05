import BaseAPIService from "@/services/api/baseService";
import settingsStorage from "@/services/storage/settingsStorage";
import { ZohoService } from "@/utils/types/services";
import Errors from "@/services/api/errors";

const ZOHO_API_BASE = "https://people.zoho.com/api/forms";

interface CheckInResponse {
    success: boolean;
    message?: string;
}

class ZohoServiceImpl extends BaseAPIService implements ZohoService {
    constructor() {
        super(ZOHO_API_BASE);
    }

    private async getHeaders(): Promise<{
        Authorization: string;
        "Content-Type": string;
    }> {
        const keys = await settingsStorage.getZohoKeys();
        if (!keys?.accessToken) {
            throw new Errors.ValidationError("Zoho API keys not found");
        }
        return {
            Authorization: `Bearer ${keys.accessToken}`,
            "Content-Type": "application/json",
        };
    }

    async checkIn(location: string): Promise<void> {
        const headers = await this.getHeaders();
        await this.request<CheckInResponse>({
            method: "POST",
            url: "/attendance/checkIn",
            headers,
            data: { location },
        });
    }

    async validateCredentials(): Promise<boolean> {
        try {
            const headers = await this.getHeaders();
            await this.request({
                method: "GET",
                url: "/user",
                headers,
            });
            return true;
        } catch (error) {
            if (error instanceof Errors.ValidationError) {
                return false;
            }
            return false;
        }
    }
}

export default ZohoServiceImpl;
