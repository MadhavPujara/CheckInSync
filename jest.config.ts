import type { Config } from "jest";

export default async (): Promise<Config> => {
    return {
        preset: "jest-expo",
        setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
        moduleNameMapper: {
            "^@/(.*)$": "<rootDir>/src/$1",
        },
        transformIgnorePatterns: [
            "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)",
        ],
    };
};
