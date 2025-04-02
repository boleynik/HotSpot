import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case 'report':
                            iconName = focused ? 'warning' : 'warning-outline';
                            break;
                        case 'index': // Map screen
                            iconName = focused ? 'map' : 'map-outline';
                            break;
                        case 'filter':
                            iconName = focused ? 'filter' : 'filter-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 30,
                    width: 300,
                    height: 60,
                    borderRadius: 80,
                    backgroundColor: '#FF9B62',
                    left: '50%',
                    transform: [{ translateX: +50 }],
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
            <Tabs.Screen name="filter" options={{ title: 'Filter' }} />
        </Tabs>
    );
}
