import React from "react";
import { Appbar } from "react-native-paper";

interface HeaderProps {
    onMenuPress: () => void;
}

export default function Header({ onMenuPress }: HeaderProps) {
    return (
        <Appbar.Header testID="header-container">
            <Appbar.Action
                testID="menu-button"
                icon="menu"
                onPress={onMenuPress}
            />
            <Appbar.Content testID="header-title" title="Check-in Helper" />
        </Appbar.Header>
    );
}
