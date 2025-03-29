import { useRouter } from "expo-router";
import SetupScreen from "@/components/screens/SetupScreen";

export default function Setup() {
    const router = useRouter();

    const handleSetupComplete = () => {
        router.replace("/");
    };

    return <SetupScreen onSetupComplete={handleSetupComplete} />;
}
