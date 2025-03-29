import React from "react";
import { Appbar } from "react-native-paper";

interface HeaderProps {
    onMenuPress: () => void;
}

export default function Header({ onMenuPress }: HeaderProps) {
    return (
        <Appbar.Header>
            <Appbar.Action icon="menu" onPress={onMenuPress} />
            <Appbar.Content title="Check-in Helper" />
        </Appbar.Header>
    );
}
