import React from "react";
import { render } from "@testing-library/react-native";
import { PaperProvider, MD3LightTheme } from "react-native-paper";

// Simple wrapper that just renders children directly
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <PaperProvider theme={MD3LightTheme}>{children}</PaperProvider>;
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
