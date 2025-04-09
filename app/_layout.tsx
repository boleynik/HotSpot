// app/_layout.tsx
import { Tabs, useRouter, Slot } from 'expo-router';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { app } from '@/config/firebaseConfig';

export default function Layout() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const router = useRouter();
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
                router.replace('/login');
            }
        });

        return unsubscribe;
    }, []);


    if (isLoggedIn === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF9B62" />
            </View>
        );
    }


    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;
                    switch (route.name) {
                        case 'report':
                            iconName = focused ? 'warning' : 'warning-outline';
                            break;
                        case 'index':
                            iconName = focused ? 'map' : 'map-outline';
                            break;
                        case 'favorites':
                            iconName = focused ? 'heart' : 'heart-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }
                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 30,
                    width: 300,
                    height: 60,
                    borderRadius: 80,
                    backgroundColor: '#FF9B62',
                    left: '50%',
                    transform: [{ translateX: -150 }], // center it properly
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                },
                tabBarActiveTintColor: '#111',
                tabBarInactiveTintColor: '#555',
                headerShown: false,
            })}
        >
            <Tabs.Screen name="report" options={{ title: 'Report' }} />
            <Tabs.Screen name="index" options={{ title: 'Map' }} />
            <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
        </Tabs>
    );
}
