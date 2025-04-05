import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import BasecampServiceImpl from "@/services/api/basecampService";
import settingsStorage from "@/services/storage/settingsStorage";
import { ValidationError } from "@/services/api/errors";
// Mocks
jest.mock("@/services/storage/settingsStorage");

describe("BasecampService", () => {
    // Create mock adapter for BasecampService's internal axios instance
    let mockAxios: MockAdapter;
    const basecampService = new BasecampServiceImpl();
    beforeEach(() => {
        jest.clearAllMocks();

        // Access the internal api instance and create a mock adapter for it
        // @ts-ignore - Accessing private property for testing
        mockAxios = new MockAdapter((basecampService as any).api);

        // Mock the settings storage
        (settingsStorage.getBasecampKeys as jest.Mock).mockResolvedValue({
            accessToken: "mock-token",
            accountId: "12345",
            projectId: "67890",
            campfireId: "123456",
        });
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe("validateCredentials", () => {
        it("should return true when credentials are valid", async () => {
            mockAxios
                .onGet("/authorization.json")
                .reply(200, { id: "user123" });

            const result = await basecampService.validateCredentials();
            expect(result).toBe(true);
        });

        it("should return false when credentials are invalid", async () => {
            // Setup mock response
            mockAxios.onAny(`/authorization.json`).reply(401);

            // Call the service
            const result = await basecampService.validateCredentials();

            // Verify the result
            expect(result).toBe(false);
        });

        it("should return false when API keys are missing", async () => {
            // Mock missing API keys
            (
                settingsStorage.getBasecampKeys as jest.Mock
            ).mockResolvedValueOnce(null);

            // Call the service
            const result = await basecampService.validateCredentials();

            // Verify the result
            expect(result).toBe(false);
        });
    });

    describe("checkIn", () => {
        it("should call API with correct parameters", async () => {
            mockAxios
                .onPost("/12345/projects/67890/messages.json")
                .reply(201, { id: 1, status: "success", content: "Hello" });

            await basecampService.checkIn("Hello, team!");

            expect(mockAxios.history.post.length).toBe(1);
            const request = mockAxios.history.post[0];
            expect(JSON.parse(request.data)).toEqual({
                content: "Hello, team!",
            });
        });

        it("should throw ValidationError when API keys are missing", async () => {
            // Mock missing API keys
            (
                settingsStorage.getBasecampKeys as jest.Mock
            ).mockResolvedValueOnce(null);

            // Expect the checkIn call to throw a ValidationError
            await expect(
                basecampService.checkIn("Hello, team!")
            ).rejects.toThrow(ValidationError);
        });

        it("should throw ValidationError when project configuration is missing", async () => {
            // We need to mock settingsStorage.getBasecampKeys TWICE
            // First call is for getHeaders, second is for the actual keys check

            // First, reset all mocks to ensure clean state
            jest.clearAllMocks();

            // First call returns valid token
            (
                settingsStorage.getBasecampKeys as jest.Mock
            ).mockResolvedValueOnce({
                accessToken: "mock-token",
            });

            // Second call returns invalid project config
            (
                settingsStorage.getBasecampKeys as jest.Mock
            ).mockResolvedValueOnce({
                accessToken: "mock-token",
                accountId: null,
                projectId: null,
            });

            // Now the test should throw ValidationError
            await expect(
                basecampService.checkIn("Hello, team!")
            ).rejects.toThrow(ValidationError);
        });
    });
});
