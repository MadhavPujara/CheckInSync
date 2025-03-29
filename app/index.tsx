import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Portal, Modal, List } from "react-native-paper";
import { useRouter } from "expo-router";
import CheckInButton from "./components/CheckInButton";
import SettingsScreen from "./components/SettingsScreen";
import Header from "./components/Header";
import settingsStorage from "./services/settingsStorage";

export default function App() {
    const router = useRouter();
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
        <View style={styles.container}>
            <Header onMenuPress={() => setIsMenuOpen(true)} />

            <View style={styles.content}>
                <CheckInButton />
            </View>

            <Portal>
                <Modal
                    visible={showSettings}
                    onDismiss={() => setShowSettings(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <SettingsScreen />
                </Modal>
            </Portal>

            <Portal>
                <Modal
                    visible={isMenuOpen}
                    onDismiss={() => setIsMenuOpen(false)}
                    contentContainerStyle={styles.menuContent}
                >
                    <List.Item
                        title="Settings"
                        left={(props) => <List.Icon {...props} icon="cog" />}
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
        backgroundColor: "#fff",
    },
    content: {
        flex: 1,
    },
    menuContent: {
        backgroundColor: "#fff",
        padding: 0,
        margin: 16,
        borderRadius: 8,
    },
    modalContent: {
        backgroundColor: "#fff",
        flex: 1,
        margin: 0,
    },
});
