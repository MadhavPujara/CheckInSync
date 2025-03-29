const mockStorage = new Map<string, string>();

export const getItemAsync = jest.fn(
    async (key: string): Promise<string | null> => {
        return mockStorage.get(key) || null;
    }
);

export const setItemAsync = jest.fn(
    async (key: string, value: string): Promise<void> => {
        mockStorage.set(key, value);
    }
);

export const deleteItemAsync = jest.fn(async (key: string): Promise<void> => {
    mockStorage.delete(key);
});

// Clear the mock storage before each test
beforeEach(() => {
    mockStorage.clear();
    getItemAsync.mockClear();
    setItemAsync.mockClear();
    deleteItemAsync.mockClear();
});
