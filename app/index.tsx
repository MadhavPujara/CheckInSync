import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Portal, Modal, List, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import CheckInButton from "@/components/ui/CheckInButton";
import SettingsScreen from "@/components/screens/SettingsScreen";
import Header from "@/components/ui/Header";
import settingsStorage from "@/services/storage/settingsStorage";

export default function App() {
    const router = useRouter();
    const theme = useTheme();
    const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(
        null
    );
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        checkSetup();
    }, []);

    const checkSetup = async () => {
        const setupComplete = await settingsStorage.isSetupComplete();
        setIsSetupComplete(setupComplete);
        if (!setupComplete) {
            router.replace("/(auth)/setup");
        }
    };

    if (isSetupComplete === null) {
        return null; // Loading state
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            <Header onMenuPress={() => setIsMenuOpen(true)} />

            <View style={styles.content}>
                <CheckInButton />
            </View>

            <Portal>
                <Modal
                    visible={showSettings}
                    onDismiss={() => setShowSettings(false)}
                    contentContainerStyle={[
                        styles.modalContent,
                        { backgroundColor: theme.colors.background },
                    ]}
                >
                    <SettingsScreen />
                </Modal>
            </Portal>

            <Portal>
                <Modal
                    visible={isMenuOpen}
                    onDismiss={() => setIsMenuOpen(false)}
                    contentContainerStyle={[
                        styles.menuContent,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    <List.Item
                        title="Settings"
                        titleStyle={{ color: theme.colors.onSurface }}
                        left={(props) => (
                            <List.Icon
                                {...props}
                                icon="cog"
                                color={theme.colors.onSurface}
                            />
                        )}
                        onPress={() => {
                            setIsMenuOpen(false);
                            setShowSettings(true);
                        }}
                    />
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    menuContent: {
        padding: 0,
        margin: 16,
        borderRadius: 8,
    },
    modalContent: {
        flex: 1,
        margin: 0,
    },
});
