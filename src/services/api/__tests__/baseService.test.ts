import axios, { AxiosInstance, AxiosResponse } from "axios";
import { BaseAPIService } from "../baseService";
import {
    APIError,
    AuthenticationError,
    NetworkError,
    RateLimitError,
} from "../errors";

// Mock axios
jest.mock("axios");

const mockRequest = jest.fn();
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

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TestAPIService();
    });

    describe("Error Handling", () => {
        it("should handle network errors", async () => {
            const networkError = new Error("Network Error");
            (networkError as any).isAxiosError = true;
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
            };
            mockRequest.mockRejectedValueOnce(apiError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                APIError
            );
        });
    });

    describe("Retry Logic", () => {
        it("should retry on network errors and succeed", async () => {
            const networkError = new Error("Network Error");
            (networkError as any).isAxiosError = true;
            const successResponse = {
                status: 200,
                data: { success: true },
            };

            mockRequest
                .mockRejectedValueOnce(networkError)
                .mockResolvedValueOnce(successResponse);

            const result = await service.testRequest({ url: "/test" });
            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(2);
        });

        it("should retry on 500 errors and succeed", async () => {
            const serverError = {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: { message: "Server Error" },
                },
                config: {},
            };
            const successResponse = {
                status: 200,
                data: { success: true },
            };

            mockRequest
                .mockImplementationOnce(() => Promise.reject(serverError))
                .mockResolvedValueOnce(successResponse);

            const result = await service.testRequest({ url: "/test" });
            expect(result).toEqual(successResponse);
            expect(mockRequest).toHaveBeenCalledTimes(2);
        });

        it("should not retry on 400 errors", async () => {
            const clientError = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: { message: "Bad Request" },
                },
                config: {},
            };

            mockRequest.mockRejectedValueOnce(clientError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                APIError
            );
            expect(mockRequest).toHaveBeenCalledTimes(1);
        });

        it("should stop retrying after max attempts", async () => {
            const networkError = new Error("Network Error");
            (networkError as any).isAxiosError = true;
            (networkError as any).config = {};

            mockRequest
                .mockRejectedValueOnce(networkError)
                .mockRejectedValueOnce(networkError)
                .mockRejectedValueOnce(networkError);

            await expect(service.testRequest({ url: "/test" })).rejects.toThrow(
                NetworkError
            );
            expect(mockRequest).toHaveBeenCalledTimes(3);
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
