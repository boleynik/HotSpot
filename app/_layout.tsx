// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;
                    switch (route.name) {
                        case 'index': // Map screen
                            iconName = focused ? 'map' : 'map-outline';
                            break;
                        case 'report': // Report screen
                            iconName = focused ? 'warning' : 'warning-outline';
                            break;
                        case 'filter': // Filter screen
                            iconName = focused ? 'filter' : 'filter-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    alignSelf: 'center',
                    width: 300, // Adjust this value to change the nav bar's width
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#F8B36C',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                },
                tabBarActiveTintColor: '#333',
                tabBarInactiveTintColor: '#666',
                headerShown: false,
            })}
        >
            <Tabs.Screen name="index" options={{ title: 'Map' }} />
            <Tabs.Screen name="report" options={{ title: 'Report' }} />
            <Tabs.Screen name="filter" options={{ title: 'Filter' }} />
        </Tabs>
    );
}
