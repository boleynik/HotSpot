import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="home" options={{ title: 'Home' }} />
        </Stack>
    );
}
