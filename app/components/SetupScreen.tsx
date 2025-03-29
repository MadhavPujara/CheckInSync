import React, { useState } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    TextInput,
    Button,
    Text,
    Card,
    useTheme,
    MD3Colors,
} from "react-native-paper";
import settingsStorage, {
    ZohoKeys,
    BasecampKeys,
} from "../services/settingsStorage";

interface SetupScreenProps {
    onSetupComplete: () => void;
}

export default function SetupScreen({ onSetupComplete }: SetupScreenProps) {
    const theme = useTheme();
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

    const handleSave = async () => {
        try {
            await settingsStorage.setZohoKeys(zohoKeys);
            await settingsStorage.setBasecampKeys(basecampKeys);
            await settingsStorage.setSetupComplete(true);
            onSetupComplete();
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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <Text variant="headlineMedium" style={styles.title}>
                    First-time Setup
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
                    Save and Continue
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
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
