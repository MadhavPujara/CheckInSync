import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
    Card,
    TextInput,
    Button,
    Text,
    useTheme,
    Switch,
    SegmentedButtons,
} from "react-native-paper";
import settingsStorage, {
    ZohoKeys,
    BasecampKeys,
} from "../../../src/services/storage/settingsStorage";
import { useThemeContext } from "@/theme/ThemeContext";

export default function SettingsScreen() {
    const theme = useTheme();
    const { themePreference, setThemePreference } = useThemeContext();

    const [zohoKeys, setZohoKeys] = useState<ZohoKeys>({
        clientId: "",
        clientSecret: "",
        refreshToken: "",
        accessToken: "",
    });

    const [basecampKeys, setBasecampKeys] = useState<BasecampKeys>({
        accessToken: "",
        accountId: "",
        projectId: "",
        campfireId: "",
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const savedZohoKeys = await settingsStorage.getZohoKeys();
        const savedBasecampKeys = await settingsStorage.getBasecampKeys();

        if (savedZohoKeys) setZohoKeys(savedZohoKeys);
        if (savedBasecampKeys) setBasecampKeys(savedBasecampKeys);
    };

    const handleSave = async () => {
        try {
            await settingsStorage.setZohoKeys(zohoKeys);
            await settingsStorage.setBasecampKeys(basecampKeys);
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings. Please try again.");
        }
    };

    const isValid = () => {
        return (
            zohoKeys.clientId.trim() &&
            zohoKeys.clientSecret.trim() &&
            zohoKeys.refreshToken.trim() &&
            basecampKeys.accessToken.trim() &&
            basecampKeys.accountId.trim() &&
            basecampKeys.projectId.trim() &&
            basecampKeys.campfireId.trim()
        );
    };

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Text
                variant="headlineMedium"
                testID="settings-text"
                style={[styles.title, { color: theme.colors.onBackground }]}
            >
                Settings
            </Text>

            <Card
                testID="appearance-card"
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
                <Card.Title
                    title="Appearance"
                    titleStyle={{ color: theme.colors.onSurface }}
                />
                <Card.Content>
                    <Text
                        style={{
                            marginBottom: 12,
                            color: theme.colors.onSurface,
                        }}
                    >
                        Theme
                    </Text>
                    <SegmentedButtons
                        value={themePreference}
                        onValueChange={(value) =>
                            setThemePreference(
                                value as "light" | "dark" | "system"
                            )
                        }
                        buttons={[
                            {
                                value: "light",
                                label: "Light",
                                icon: "white-balance-sunny",
                            },
                            {
                                value: "dark",
                                label: "Dark",
                                icon: "weather-night",
                            },
                            {
                                value: "system",
                                label: "Auto",
                                icon: "theme-light-dark",
                            },
                        ]}
                        style={{ marginBottom: 16 }}
                    />
                </Card.Content>
            </Card>

            <Card
                testID="zoho-people-api-keys-card"
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
                <Card.Title
                    title="Zoho People API Keys"
                    titleStyle={{ color: theme.colors.onSurface }}
                />
                <Card.Content>
                    <TextInput
                        mode="outlined"
                        label="Client ID"
                        value={zohoKeys.clientId}
                        onChangeText={(text) =>
                            setZohoKeys({ ...zohoKeys, clientId: text })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="zoho-client-id-input"
                    />
                    <TextInput
                        mode="outlined"
                        label="Client Secret"
                        value={zohoKeys.clientSecret}
                        onChangeText={(text) =>
                            setZohoKeys({ ...zohoKeys, clientSecret: text })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="zoho-client-secret-input"
                    />
                    <TextInput
                        mode="outlined"
                        label="Refresh Token"
                        value={zohoKeys.refreshToken}
                        onChangeText={(text) =>
                            setZohoKeys({ ...zohoKeys, refreshToken: text })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="zoho-refresh-token-input"
                    />
                </Card.Content>
            </Card>

            <Card
                testID="basecamp-api-keys-card"
                style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
                <Card.Title
                    title="Basecamp API Keys"
                    titleStyle={{ color: theme.colors.onSurface }}
                />
                <Card.Content>
                    <TextInput
                        mode="outlined"
                        label="Access Token"
                        value={basecampKeys.accessToken}
                        onChangeText={(text) =>
                            setBasecampKeys({
                                ...basecampKeys,
                                accessToken: text,
                            })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="basecamp-access-token-input"
                    />
                    <TextInput
                        mode="outlined"
                        label="Account ID"
                        value={basecampKeys.accountId}
                        onChangeText={(text) =>
                            setBasecampKeys({
                                ...basecampKeys,
                                accountId: text,
                            })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="basecamp-account-id-input"
                    />
                    <TextInput
                        mode="outlined"
                        label="Project ID"
                        value={basecampKeys.projectId}
                        onChangeText={(text) =>
                            setBasecampKeys({
                                ...basecampKeys,
                                projectId: text,
                            })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="basecamp-project-id-input"
                    />
                    <TextInput
                        mode="outlined"
                        label="Campfire ID"
                        value={basecampKeys.campfireId}
                        onChangeText={(text) =>
                            setBasecampKeys({
                                ...basecampKeys,
                                campfireId: text,
                            })
                        }
                        autoCapitalize="none"
                        style={styles.input}
                        textColor={theme.colors.onBackground}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                        testID="basecamp-campfire-id-input"
                    />
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handleSave}
                disabled={!isValid()}
                style={styles.button}
                testID="save-button"
            >
                Save Changes
            </Button>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        marginBottom: 24,
        textAlign: "center",
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginTop: 8,
        marginBottom: 24,
        padding: 8,
    },
});
