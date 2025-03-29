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
                const config = error.config as AxiosRequestConfig & {
                    __retryCount?: number;
                };

                if (!config) {
                    return Promise.reject(this.handleError(error));
                }

                config.__retryCount = (config.__retryCount || 0) + 1;

                // Check if we should retry and haven't exceeded max retries
                if (
                    this.shouldRetry(error) &&
                    config.__retryCount <= this.maxRetries
                ) {
                    await this.delay(this.retryDelay * config.__retryCount);
                    return this.api.request(config);
                }

                return Promise.reject(this.handleError(error));
            }
        );
    }

    private shouldRetry(error: unknown): boolean {
        if (!error || typeof error !== "object") return false;
        const axiosError = error as AxiosError<APIResponse>;

        if (!axiosError.isAxiosError) return false;
        if (!axiosError.response) return true;

        return (
            axiosError.response.status >= 500 ||
            axiosError.response.status === 429
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    protected handleError(error: unknown): Error {
        if (!error || typeof error !== "object") {
            return new Errors.NetworkError();
        }

        const axiosError = error as AxiosError<APIResponse>;

        if (!axiosError.response) {
            const error = new Errors.NetworkError();
            return error;
        }

        const { status, data } = axiosError.response;

        switch (status) {
            case 401:
                return new Errors.AuthenticationError();
            case 429:
                return new Errors.RateLimitError();
            case 400:
            case 404:
                return new Errors.APIError(
                    data?.message || "Client error",
                    status,
                    data
                );
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
            return await this.api.request<T>(config);
        } catch (error) {
            throw this.handleError(error);
        }
    }
}
