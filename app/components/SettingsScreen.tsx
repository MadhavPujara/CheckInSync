import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, TextInput, Button, Text } from "react-native-paper";
import settingsStorage, {
    ZohoKeys,
    BasecampKeys,
} from "../services/settingsStorage";

export default function SettingsScreen() {
    const [zohoKeys, setZohoKeys] = useState<ZohoKeys>({
        clientId: "",
        clientSecret: "",
        refreshToken: "",
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
        <ScrollView style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>
                Settings
            </Text>

            <Card style={styles.card}>
                <Card.Title title="Zoho People API Keys" />
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
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Title title="Basecamp API Keys" />
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
                    />
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={handleSave}
                disabled={!isValid()}
                style={styles.button}
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
        backgroundColor: "#fff",
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
