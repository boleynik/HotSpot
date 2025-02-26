// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                // Determine which icon to display based on the route name
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'index': // Map route
                            iconName = focused ? 'map' : 'map-outline';
                            break;
                        case 'report':
                            iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                            break;
                        case 'menu':
                            iconName = focused ? 'menu' : 'menu-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                // Customize tab bar style here
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    // Adjust left/right to change width of the bar
                    left: 50,
                    right: 50,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#F8B36C', // Your orange color

                    // Optional shadow
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 8,
                },
                tabBarActiveTintColor: '#333',   // Icon color when active
                tabBarInactiveTintColor: '#666', // Icon color when inactive

                // Hide any header, if you prefer
                headerShown: false,
            })}
        >
            {/* "index" is your Map screen (app/index.tsx) */}
            <Tabs.Screen
                name="index"
                options={{ title: 'Map' }}
            />
            {/* "report" is your report screen (app/report.tsx) */}
            <Tabs.Screen
                name="report"
                options={{ title: 'Report' }}
            />
            {/* "menu" is your Menu screen (app/menu.tsx) */}
            <Tabs.Screen
                name="menu"
                options={{ title: 'Menu' }}
            />
        </Tabs>
    );
}
