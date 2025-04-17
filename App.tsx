// App.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
    createNativeStackNavigator,
    NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { app } from './config/firebaseConfig';

// Screens
import LoginScreen      from './screens/LoginScreen';
import SignupScreen     from './screens/SignupScreen';
import MapScreen        from './screens/MapScreen';
import ReportScreen     from './screens/ReportScreen';
import FavoritesScreen  from './screens/FavoritesScreen';
import DetailedView     from './screens/DetailedView';

const AuthStack = createNativeStackNavigator();
const Stack     = createNativeStackNavigator();
const Tab       = createBottomTabNavigator();

// Shared stack options
const stackScreenOpts: NativeStackNavigationOptions = {
    headerShown: false,           // Hide all headers by default
    animation: 'slide_from_right',
};

function ReportStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOpts}>
            <Stack.Screen name="Main" component={ReportScreen} />
            <Stack.Screen
                name="DetailedView"
                component={DetailedView}
                options={{ headerShown: false }}    // no header here either
            />
        </Stack.Navigator>
    );
}

function MapStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOpts}>
            <Stack.Screen name="Main" component={MapScreen} />
            <Stack.Screen
                name="DetailedView"
                component={DetailedView}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function FavoritesStack() {
    return (
        <Stack.Navigator screenOptions={stackScreenOpts}>
            <Stack.Screen name="Main" component={FavoritesScreen} />
            <Stack.Screen
                name="DetailedView"
                component={DetailedView}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function AppTabs() {
    const NAV_WIDTH = 300;

    return (
        <Tab.Navigator
            initialRouteName="Map"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 30,
                    left: '50%',
                    transform: [{ translateX: 50 }],
                    width: NAV_WIDTH,
                    height: 60,
                    borderRadius: 80,
                    backgroundColor: '#FF9B62',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                },
                tabBarActiveTintColor: '#111',
                tabBarInactiveTintColor: '#555',
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'ellipse';
                    if (route.name === 'Report')    iconName = 'warning';
                    if (route.name === 'Map')       iconName = 'map';
                    if (route.name === 'Favorites') iconName = 'heart';
                    return <Ionicons name={iconName as any} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Report"
                component={ReportStack}
                options={{ title: 'Report' }}
            />
            <Tab.Screen
                name="Map"
                component={MapStack}
                options={{ title: 'Map' }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesStack}
                options={{ title: 'Favorites' }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    const [user, setUser] = useState<any>(null);
    const [initializing, setInitializing] = useState(true);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, u => {
            setUser(u);
            if (initializing) setInitializing(false);
        });
        return unsubscribe;
    }, []);

    if (initializing) {
        return (
            <View style={{ flex:1,justifyContent:'center',alignItems:'center' }}>
                <ActivityIndicator size="large" color="#FF9B62" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? (
                <AppTabs />
            ) : (
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                    <AuthStack.Screen name="Login"  component={LoginScreen}  />
                    <AuthStack.Screen name="Signup" component={SignupScreen} />
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
}
