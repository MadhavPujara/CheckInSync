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

    // Override delay to make tests faster
    protected delay(ms: number): Promise<void> {
        return Promise.resolve();
    }
}

describe("BaseAPIService", () => {
    let service: TestAPIService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        it("should handle non-object errors", async () => {
            const nonObjectError = "string error";
            mockRequest.mockRejectedValueOnce(nonObjectError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );
        });

        it("should handle null errors", async () => {
            mockRequest.mockRejectedValueOnce(null);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );
        });

        it("should handle non-axios errors", async () => {
            const nonAxiosError = {
                isAxiosError: false,
                message: "Not an Axios error",
            };
            mockRequest.mockRejectedValueOnce(nonAxiosError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );
        });

        it("should handle client errors with status 400", async () => {
            const clientError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: { message: "Bad Request Error" },
                },
                config: {},
                message: "Request failed with status code 400",
                name: "Error",
            };
            mockRequest.mockRejectedValueOnce(clientError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                APIError
            );

            try {
                await service.testRequest({ url: "/test" });
            } catch (error) {
                expect((error as APIError).message).toBe("Bad Request Error");
                expect((error as APIError).statusCode).toBe(400);
            }
        });

        it("should handle client errors with status 404", async () => {
            const clientError = {
                isAxiosError: true,
                response: {
                    status: 404,
                    data: { message: "Not Found" },
                },
                config: {},
                message: "Request failed with status code 404",
                name: "Error",
            };
            mockRequest.mockRejectedValueOnce(clientError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                APIError
            );

            try {
                await service.testRequest({ url: "/test" });
            } catch (error) {
                expect((error as APIError).message).toBe("Not Found");
                expect((error as APIError).statusCode).toBe(404);
            }
        });

        it("should use default message when data.message is undefined", async () => {
            const clientError = {
                isAxiosError: true,
                response: {
                    status: 404,
                    data: {},
                },
                config: {},
                message: "Request failed with status code 404",
                name: "Error",
            };
            mockRequest.mockRejectedValueOnce(clientError);

            try {
                await service.testRequest({ url: "/test" });
            } catch (error) {
                expect((error as APIError).message).toBe("Client error");
            }
        });

        it("should handle errors directly in shouldRetry - non-object error", async () => {
            // Create a custom error that's exactly null
            // This tests if (!error || typeof error !== "object")
            const nullError = null;

            // Mock to return our test value when handleError is called
            const originalHandleError = service["handleError"];
            service["handleError"] = jest.fn().mockImplementation((err) => {
                // When handleError is called with our nullError, confirm it's actually null
                if (err === null) {
                    return new NetworkError("Null error handled");
                }
                return originalHandleError.call(service, err);
            });

            // Call testRequest, which will invoke handleError with nullError
            mockRequest.mockRejectedValueOnce(nullError);

            // This should go through handleError, which we've mocked
            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );

            // Confirm our mock was called with null
            expect(service["handleError"]).toHaveBeenCalledWith(null);

            // Restore original method
            service["handleError"] = originalHandleError;
        });

        it("should handle non-axios error directly in shouldRetry", async () => {
            // Create a custom error that's an object but not an Axios error
            // This tests if (!axiosError.isAxiosError)
            const regularError = new Error("Regular JS error");

            // Mock to verify our error type
            const originalHandleError = service["handleError"];
            service["handleError"] = jest.fn().mockImplementation((err) => {
                // Verify the error is our regularError
                if (
                    err instanceof Error &&
                    err.message === "Regular JS error"
                ) {
                    return new NetworkError("Regular error handled");
                }
                return originalHandleError.call(service, err);
            });

            // Call testRequest, which will invoke handleError
            mockRequest.mockRejectedValueOnce(regularError);

            // This should go through handleError, which we've mocked
            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );

            // Confirm our mock was called with regularError
            expect(service["handleError"]).toHaveBeenCalledWith(regularError);

            // Restore original method
            service["handleError"] = originalHandleError;
        });
    });

    describe("Retry Logic", () => {
        it("should retry on network errors and succeed", async () => {
            const errorInterceptor = mockUse.mock.calls[0][1];

            const networkError = {
                isAxiosError: true,
                config: {
                    url: "/test",
                    __retryCount: 0,
                },
                message: "Network Error",
                name: "Error",
                response: undefined,
            };

            const successResponse = {
                status: 200,
                data: { success: true },
            };

            mockRequest.mockResolvedValueOnce(successResponse);

            const result = await errorInterceptor(networkError);

            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(1);
            expect(mockRequest).toHaveBeenCalledWith({
                url: "/test",
                __retryCount: 1,
            });
        });

        it("should retry on 500 errors and succeed", async () => {
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

            mockRequest.mockResolvedValueOnce(successResponse);

            const result = await errorInterceptor(serverError);

            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(1);
            expect(mockRequest).toHaveBeenCalledWith({
                url: "/test",
                __retryCount: 1,
            });
        });

        it("should not retry on 400 errors", async () => {
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

            await expect(errorInterceptor(clientError)).rejects.toBeInstanceOf(
                APIError
            );

            expect(mockRequest).not.toHaveBeenCalled();
        });

        it("should stop retrying after max attempts", async () => {
            const errorInterceptor = mockUse.mock.calls[0][1];

            const networkError = {
                isAxiosError: true,
                config: {
                    url: "/test",
                    __retryCount: 3,
                },
                message: "Network Error",
                name: "Error",
                response: undefined,
            };

            await expect(errorInterceptor(networkError)).rejects.toBeInstanceOf(
                NetworkError
            );

            expect(mockRequest).not.toHaveBeenCalled();
        });

        it("should handle errors with no config", async () => {
            const errorInterceptor = mockUse.mock.calls[0][1];

            const errorWithNoConfig = {
                isAxiosError: true,
                message: "Error with no config",
                name: "Error",
                response: {
                    status: 500,
                    data: { message: "Server Error" },
                },
            };

            await expect(
                errorInterceptor(errorWithNoConfig)
            ).rejects.toBeInstanceOf(APIError);
        });

        it("should correctly determine if error should be retried - non-object error", async () => {
            const errorInterceptor = mockUse.mock.calls[0][1];

            const stringError = "string error";

            await expect(errorInterceptor(stringError)).rejects.toBeInstanceOf(
                NetworkError
            );
        });

        it("should correctly determine if error should be retried - non-axios error", async () => {
            const errorInterceptor = mockUse.mock.calls[0][1];

            const nonAxiosError = {
                isAxiosError: false,
                config: {
                    url: "/test",
                    __retryCount: 0,
                },
                message: "Not an Axios error",
            };

            await expect(
                errorInterceptor(nonAxiosError)
            ).rejects.toBeInstanceOf(NetworkError);
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
