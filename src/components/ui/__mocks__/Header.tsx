import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface HeaderProps {
    onMenuPress: () => void;
}

export default function MockHeader({ onMenuPress }: HeaderProps) {
    return (
        <View testID="header-container">
            <TouchableOpacity testID="menu-button" onPress={onMenuPress}>
                <Text>Menu</Text>
            </TouchableOpacity>
            <Text testID="header-title">Check-in Helper</Text>
        </View>
    );
}
