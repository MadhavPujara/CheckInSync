import type { Config } from "jest";

export default async (): Promise<Config> => {
    return {
        preset: "jest-expo",
        testEnvironment: "node",
        setupFilesAfterEnv: [
            "<rootDir>/jest.setup.ts",
            "@testing-library/jest-native/extend-expect",
        ],
        moduleNameMapper: {
            "^@/(.*)$": "<rootDir>/src/$1",
        },
        transformIgnorePatterns: [
            "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
        ],
    };
};
