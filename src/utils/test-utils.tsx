import React from "react";
import { render } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={MD3LightTheme}>{children}</PaperProvider>
        </SafeAreaProvider>
    );
};

const customRender = (ui: React.ReactElement, options = {}) =>
    render(ui, { wrapper: AllTheProviders, ...options });

// Export everything
export * from "@testing-library/react-native";
export { customRender as render };

export default {
    render: customRender,
    AllTheProviders,
};
