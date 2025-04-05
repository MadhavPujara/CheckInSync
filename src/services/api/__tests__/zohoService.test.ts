import axios from "axios";
import ZohoServiceImpl from "@/services/api/zohoService";
import settingsStorage from "@/services/storage/settingsStorage";
import { ValidationError, APIError, NetworkError } from "@/services/api/errors"; // Import specific errors

// Mock the entire axios module
jest.mock("axios");
jest.mock("@/services/storage/settingsStorage");

// Cast axios to its mocked type
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Define a reusable mock Axios instance structure
const mockAxiosInstance = {
    request: jest.fn(),
    interceptors: {
        response: { use: jest.fn() },
        request: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
};

// Configure axios.create to return our mock instance *before* importing the service
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

// Now import the service, which will use the mocked create function

describe("ZohoService", () => {
    let zohoService: ZohoServiceImpl; // Variable to hold the instance

    beforeEach(() => {
        // Clear all mocks (including storage and axios mocks like request)
        jest.clearAllMocks();

        // Re-configure mockReturnValue in case it was modified by a previous test (though unlikely here)
        // This ensures the constructor gets the expected mock structure.
        mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

        // Create a new instance for each test
        zohoService = new ZohoServiceImpl();

        // Clear call history on the shared mock functions after instance creation
        (mockAxiosInstance.request as jest.Mock).mockClear();
        (mockAxiosInstance.get as jest.Mock).mockClear();
        (mockAxiosInstance.post as jest.Mock).mockClear();
        (mockAxiosInstance.interceptors.response.use as jest.Mock).mockClear();
        (mockAxiosInstance.interceptors.request.use as jest.Mock).mockClear();

        // Mock the settings storage to return valid keys by default
        (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValue({
            accessToken: "mock-token",
            clientId: "client123",
            clientSecret: "secret123",
            refreshToken: "refresh123",
        });
    });

    // Remove afterEach with mockRequest.restore()
    // afterEach(() => { ... });

    describe("checkIn", () => {
        const checkInUrl = "/attendance/checkIn";
        const checkInData = { location: "Office" };
        const expectedHeaders = {
            Authorization: "Bearer mock-token",
            "Content-Type": "application/json",
        };

        it("should call API with correct parameters", async () => {
            // Mock the internal this.api.request call to succeed
            (mockAxiosInstance.request as jest.Mock).mockResolvedValueOnce({
                data: { success: true },
                status: 200,
            });

            await zohoService.checkIn("Office");

            // Verify the mocked request call
            expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: "POST",
                url: checkInUrl,
                headers: expectedHeaders,
                data: checkInData,
            });
        });

        it("should throw ValidationError when API keys are missing", async () => {
            (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValueOnce(
                null
            );

            // Use try/catch for assertion instead of .rejects
            let errorThrown: Error | null = null;
            try {
                await zohoService.checkIn("Office");
            } catch (e) {
                errorThrown = e as Error;
            }

            // Assert that an error was caught and it's the correct type/message
            expect(errorThrown).toBeInstanceOf(ValidationError);
            expect(errorThrown?.message).toBe("Zoho API keys not found");

            // Verify the request was NOT made
            expect(mockAxiosInstance.request).not.toHaveBeenCalled();
        });

        it("should throw ValidationError when access token is missing", async () => {
            (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValueOnce({
                accessToken: null, // Missing access token
                clientId: "client123",
                clientSecret: "secret123",
                refreshToken: "refresh123",
            });

            // Use try/catch for assertion instead of .rejects
            let errorThrown: Error | null = null;
            try {
                await zohoService.checkIn("Office");
            } catch (e) {
                errorThrown = e as Error;
            }

            // Assert that an error was caught and it's the correct type/message
            expect(errorThrown).toBeInstanceOf(ValidationError);
            expect(errorThrown?.message).toBe("Zoho API keys not found"); // Matches the error message in getHeaders

            // Verify the request was NOT made
            expect(mockAxiosInstance.request).not.toHaveBeenCalled();
        });

        it("should handle API errors (e.g., 500) gracefully", async () => {
            // Mock the internal this.api.request call to fail with a 500
            const apiError = {
                response: { status: 500, data: { message: "Server Error" } },
                isAxiosError: true,
                message: "Request failed with status code 500",
                // Ensure config is present, as interceptors might access it
                config: { url: checkInUrl, method: "POST", headers: {} },
            };
            // Use mockRejectedValue to make *all* attempts fail (including retries)
            (mockAxiosInstance.request as jest.Mock).mockRejectedValue(
                apiError
            );

            // BaseService handleError should convert this to an APIError
            // Use try/catch or check properties after catching with .rejects
            try {
                await zohoService.checkIn("Office");
                // If it doesn't throw, fail the test
                throw new Error("Promise should have rejected but resolved.");
            } catch (error) {
                expect(error).toBeInstanceOf(APIError);
                // Explicitly check properties on the caught error instance
                const apiErrorInstance = error as APIError;
                expect(apiErrorInstance.statusCode).toBe(500);
                expect(apiErrorInstance.message).toBe("Server Error");
                // Optionally check the data property if needed
                // The 'response' property holds the raw response data
            }

            // Verify the request was made (potentially multiple times due to retry)
            expect(mockAxiosInstance.request).toHaveBeenCalled();
        });

        it("should handle network errors gracefully", async () => {
            // Mock the internal this.api.request call to fail without a response
            const networkError = new Error("Network Error");
            (networkError as any).isAxiosError = true; // Mock Axios error structure
            (networkError as any).config = { headers: {} };
            (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(
                networkError
            );

            // BaseService handleError should convert this to a NetworkError
            await expect(zohoService.checkIn("Office")).rejects.toThrow(
                NetworkError
            );

            expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
        });
    });

    describe("validateCredentials", () => {
        const userUrl = "/user";
        const expectedHeaders = {
            Authorization: "Bearer mock-token",
            "Content-Type": "application/json", // getHeaders adds this
        };

        it("should return true when credentials are valid", async () => {
            // Mock the internal this.api.request call to succeed
            (mockAxiosInstance.request as jest.Mock).mockResolvedValueOnce({
                data: { id: "user123" },
                status: 200,
            });

            const result = await zohoService.validateCredentials();
            expect(result).toBe(true);

            // Verify the request was made correctly
            expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
            expect(mockAxiosInstance.request).toHaveBeenCalledWith({
                method: "GET",
                url: userUrl,
                headers: expectedHeaders,
            });
        });

        it("should return false when credentials are invalid (API returns 401)", async () => {
            // Mock the internal this.api.request call to fail with 401
            const authError = {
                response: { status: 401, data: { message: "Unauthorized" } },
                isAxiosError: true,
                message: "Request failed with status code 401",
                config: { headers: {} },
            };
            (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(
                authError
            );

            const result = await zohoService.validateCredentials();

            // validateCredentials catches the error and returns false
            expect(result).toBe(false);

            // Verify the request was made
            expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
        });

        it("should return false when the request fails for other reasons (e.g., 500)", async () => {
            // Mock the internal this.api.request call to fail with 500
            const apiError = {
                response: { status: 500, data: { message: "Server Error" } },
                isAxiosError: true,
                message: "Request failed with status code 500",
                config: { headers: {} },
            };
            (mockAxiosInstance.request as jest.Mock).mockRejectedValueOnce(
                apiError
            );

            const result = await zohoService.validateCredentials();

            // validateCredentials catches the error and returns false
            expect(result).toBe(false);

            // Verify the request was made
            expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
        });

        it("should return false when API keys are missing", async () => {
            (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValueOnce(
                null
            );

            // validateCredentials catches the ValidationError from getHeaders and returns false
            const result = await zohoService.validateCredentials();
            expect(result).toBe(false);

            // Verify no request was made
            expect(mockAxiosInstance.request).not.toHaveBeenCalled();
        });

        it("should return false when access token is missing", async () => {
            (settingsStorage.getZohoKeys as jest.Mock).mockResolvedValueOnce({
                accessToken: null, // Missing access token
                clientId: "client123",
                clientSecret: "secret123",
                refreshToken: "refresh123",
            });

            // validateCredentials catches the ValidationError from getHeaders and returns false
            const result = await zohoService.validateCredentials();
            expect(result).toBe(false);

            // Verify no request was made
            expect(mockAxiosInstance.request).not.toHaveBeenCalled();
        });
    });
});
