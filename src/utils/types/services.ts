export interface BasecampService {
    checkIn: (message: string) => Promise<void>;
    validateCredentials: () => Promise<boolean>;
}

export interface ZohoService {
    checkIn: (location: string) => Promise<void>;
    validateCredentials: () => Promise<boolean>;
}

export interface StorageService {
    getItem: <T>(key: string) => Promise<T | null>;
    setItem: <T>(key: string, value: T) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}
