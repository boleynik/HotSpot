// app/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function Layout() {
  return (
      <Tabs
          screenOptions={({ route }) => ({
            // Configure the tab bar's icons
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: string = 'ellipse';
              if (route.name === 'index') {
                iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
              } else if (route.name === 'map') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'menu') {
                iconName = focused ? 'menu' : 'menu-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },

            // Pills-shaped tab bar styling
            tabBarStyle: {
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#F8B36C', // your orange color
              // Shadow
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 8,
            },
            tabBarActiveTintColor: '#333',
            tabBarInactiveTintColor: '#666',

            // Hide any header if you want
            headerShown: false,
          })}
      >
        {/* Each <Tabs.Screen> corresponds to a file in /app */}
        <Tabs.Screen
            name="index"
            options={{ title: 'Chat' }}
        />
        <Tabs.Screen
            name="map"
            options={{ title: 'Map' }}
        />
        <Tabs.Screen
            name="menu"
            options={{ title: 'Menu' }}
        />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  // If you want additional shared styles, put them here
});
