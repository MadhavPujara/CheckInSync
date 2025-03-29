import axios, { AxiosResponse } from "axios";
import BaseAPIService from "@/services/api/baseService";
import {
    APIError,
    AuthenticationError,
    NetworkError,
    RateLimitError,
} from "@/services/api/errors";

// Mock axios
jest.mock("axios");

const mockRequest = jest.fn();
// Simple mock without extra properties
const mockUse = jest.fn();
const mockAxiosCreate = jest.fn(() => ({
    request: mockRequest,
    interceptors: {
        response: {
            use: mockUse,
        },
    },
}));

(axios.create as jest.Mock) = mockAxiosCreate;

// Test implementation of BaseAPIService
class TestAPIService extends BaseAPIService {
    constructor() {
        super("https://api.test.com");
    }

    async testRequest<T>(config: any): Promise<AxiosResponse<T>> {
        return this.request(config);
    }
}

describe("BaseAPIService", () => {
    let service: TestAPIService;
    let errorInterceptor: any;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TestAPIService();
        // Store the error interceptor for use in tests
        [, errorInterceptor] = mockUse.mock.calls[0];
    });

    describe("Error Handling", () => {
        it("should handle network errors", async () => {
            const networkError = {
                isAxiosError: true,
                config: {},
                message: "Network Error",
                name: "Error",
                response: undefined,
            };
            mockRequest.mockRejectedValueOnce(networkError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );
        });

        it("should handle authentication errors", async () => {
            const authError = {
                isAxiosError: true,
                response: {
                    status: 401,
                    data: { message: "Unauthorized" },
                },
                config: {},
                message: "Request failed with status code 401",
                name: "Error",
            };
            mockRequest.mockRejectedValueOnce(authError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                AuthenticationError
            );
        });

        it("should handle rate limit errors", async () => {
            const rateLimitError = {
                isAxiosError: true,
                response: {
                    status: 429,
                    data: { message: "Too Many Requests" },
                },
                config: {},
                message: "Request failed with status code 429",
                name: "Error",
            };
            mockRequest.mockRejectedValueOnce(rateLimitError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                RateLimitError
            );
        });

        it("should handle generic API errors", async () => {
            const apiError = {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: { message: "Internal Server Error" },
                },
                config: {},
                message: "Request failed with status code 500",
                name: "Error",
            };
            mockRequest.mockRejectedValueOnce(apiError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                APIError
            );
        });
    });

    describe("Retry Logic", () => {
        it("should retry on network errors and succeed", async () => {
            // Since we're testing retry logic which happens in interceptors,
            // we need to manually call the error interceptor function

            // Get the error interceptor handler that was registered
            const errorInterceptor = mockUse.mock.calls[0][1];

            // Create network error with retry config
            const networkError = {
                isAxiosError: true,
                config: {
                    url: "/test",
                    __retryCount: 0, // Start with 0 retries
                },
                message: "Network Error",
                name: "Error",
                response: undefined,
            };

            const successResponse = {
                status: 200,
                data: { success: true },
            };

            // Set up request mock to succeed on second call
            mockRequest.mockResolvedValueOnce(successResponse);

            // Manually invoke the error interceptor with our error
            // This simulates Axios interceptor behavior
            const result = await errorInterceptor(networkError);

            // Verify the retry worked
            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(1);
            expect(mockRequest).toHaveBeenCalledWith({
                url: "/test",
                __retryCount: 1, // Should be incremented
            });
        });

        it("should retry on 500 errors and succeed", async () => {
            // Get the error interceptor handler that was registered
            const errorInterceptor = mockUse.mock.calls[0][1];

            const serverError = {
                isAxiosError: true,
                config: {
                    url: "/test",
                    __retryCount: 0,
                },
                message: "Request failed with status code 500",
                name: "Error",
                response: {
                    status: 500,
                    data: { message: "Server Error" },
                },
            };

            const successResponse = {
                status: 200,
                data: { success: true },
            };

            // Set up request mock to succeed on retry
            mockRequest.mockResolvedValueOnce(successResponse);

            // Manually invoke the error interceptor
            const result = await errorInterceptor(serverError);

            // Verify the retry worked
            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(1);
            expect(mockRequest).toHaveBeenCalledWith({
                url: "/test",
                __retryCount: 1,
            });
        });

        it("should not retry on 400 errors", async () => {
            // Get the error interceptor handler that was registered
            const errorInterceptor = mockUse.mock.calls[0][1];

            const clientError = {
                isAxiosError: true,
                config: {
                    url: "/test",
                    __retryCount: 0,
                },
                message: "Request failed with status code 400",
                name: "Error",
                response: {
                    status: 400,
                    data: { message: "Bad Request" },
                },
            };

            // We expect this to throw an APIError
            await expect(errorInterceptor(clientError)).rejects.toBeInstanceOf(
                APIError
            );

            // Verify no retry happened
            expect(mockRequest).not.toHaveBeenCalled();
        });

        it("should stop retrying after max attempts", async () => {
            // Get the error interceptor handler that was registered
            const errorInterceptor = mockUse.mock.calls[0][1];

            const networkError = {
                isAxiosError: true,
                config: {
                    url: "/test",
                    __retryCount: 3, // Max retries already reached
                },
                message: "Network Error",
                name: "Error",
                response: undefined,
            };

            // We expect this to throw a NetworkError
            await expect(errorInterceptor(networkError)).rejects.toBeInstanceOf(
                NetworkError
            );

            // Verify no retry happened
            expect(mockRequest).not.toHaveBeenCalled();
        });
    });

    describe("Successful Requests", () => {
        it("should handle successful requests", async () => {
            const successResponse = {
                status: 200,
                data: { success: true },
            };

            mockRequest.mockResolvedValueOnce(successResponse);

            const result = await service.testRequest({ url: "/test" });
            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it("should pass request config correctly", async () => {
            const config = {
                url: "/test",
                method: "POST",
                data: { test: true },
            };
            const successResponse = {
                status: 200,
                data: {},
            };

            mockRequest.mockResolvedValueOnce(successResponse);

            await service.testRequest(config);
            expect(mockRequest).toHaveBeenCalledWith(config);
        });
    });
});
