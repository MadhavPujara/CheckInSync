import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import * as Location from "expo-location";
import zohoService from "../services/zohoService";
import basecampService from "../services/basecampService";

export default function CheckInButton() {
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        try {
            setLoading(true);

            // Request location permission
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                alert("Location permission is required for check-in!");
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Check in to Zoho
            await zohoService.checkIn(latitude, longitude);

            // Send message to Basecamp
            const message = `✅ Checked in at ${new Date().toLocaleTimeString()}`;
            await basecampService.sendCampfireMessage(message);

            alert("Successfully checked in and notified team!");
        } catch (error) {
            console.error("Check-in failed:", error);
            alert("Failed to check in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                mode="contained"
                onPress={handleCheckIn}
                disabled={loading}
                loading={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
            >
                Check In
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    button: {
        width: 200,
    },
    buttonContent: {
        height: 48,
    },
});
