import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
} from "axios";
import Errors from "./errors";

interface APIResponse {
    message?: string;
    [key: string]: any;
}

export default abstract class BaseAPIService {
    protected api: AxiosInstance;
    private maxRetries = 3;
    private retryDelay = 1000; // 1 second

    constructor(baseURL: string) {
        this.api = axios.create({
            baseURL,
            timeout: 10000,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError<APIResponse>) => {
                if (!error.config) throw this.handleError(error);

                const retryCount = (error.config as any).__retryCount || 0;
                if (retryCount >= this.maxRetries) {
                    throw this.handleError(error);
                }

                if (this.shouldRetry(error)) {
                    (error.config as any).__retryCount = retryCount + 1;
                    await this.delay(this.retryDelay * (retryCount + 1));
                    return this.api(error.config);
                }

                throw this.handleError(error);
            }
        );
    }

    private shouldRetry(error: unknown): boolean {
        if (!error || typeof error !== "object") return false;
        const axiosError = error as AxiosError<APIResponse>;
        if (!axiosError.isAxiosError) return false;
        return (
            !axiosError.response || // Network errors
            axiosError.response.status === 429 || // Rate limiting
            axiosError.response.status >= 500 // Server errors
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    protected handleError(error: unknown): Error {
        if (!error || typeof error !== "object") {
            return new Errors.NetworkError();
        }

        if (!("response" in error)) {
            return new Errors.NetworkError();
        }

        const axiosError = error as AxiosError<APIResponse>;
        if (!axiosError.response) {
            return new Errors.NetworkError();
        }

        const { status, data } = axiosError.response;

        switch (status) {
            case 401:
                return new Errors.AuthenticationError();
            case 429:
                return new Errors.RateLimitError();
            default:
                return new Errors.APIError(
                    data?.message || "An unexpected error occurred",
                    status,
                    data
                );
        }
    }

    protected async request<T>(
        config: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        try {
            const response = await this.api.request<T>(config);
            if (!response) {
                throw new Errors.NetworkError();
            }
            return response;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}
