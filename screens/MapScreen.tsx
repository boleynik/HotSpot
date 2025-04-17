// screens/MapScreen.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';         // <-- React Navigation
import { db } from '../config/firebaseConfig';

const PSU_REGION = {
    latitude: 40.7982,
    longitude: -77.8599,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

const { width } = Dimensions.get('window');
const crowdColors = { 0: 'green', 1: 'yellow', 2: 'red' };

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState<string|null>(null);
    const [region, setRegion] = useState(PSU_REGION);
    const [locations, setLocations] = useState<any[]>([]);
    const navigation = useNavigation();                             // <-- hook

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            const current = await Location.getCurrentPositionAsync({});
            setLocation(current.coords);
            setRegion(r => ({
                ...r,
                latitude: current.coords.latitude,
                longitude: current.coords.longitude,
            }));
        })();
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'locations'),
            qs => {
                const docs = qs.docs.map(d => ({ id: d.id, ...d.data() }));
                setLocations(docs);
            },
            err => console.error("Error fetching locations:", err)
        );
        return unsub;
    }, []);

    return (
        <View style={styles.container}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            <MapView
                style={StyleSheet.absoluteFill}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation
                showsMyLocationButton
                userInterfaceStyle="dark"
            >
                {location && (
                    <Marker coordinate={location} title="Your Location" />
                )}

                {locations.map(loc => (
                    <Marker
                        key={loc.id}
                        coordinate={{
                            latitude: loc.coordinates.latitude,
                            longitude: loc.coordinates.longitude,
                        }}
                        pinColor={crowdColors[loc.crowdLevel] || 'gray'}
                    >
                        <Callout
                            onPress={() => {
                                // <-- React Navigation call
                                navigation.navigate('DetailedView' as never, {
                                    locationId: loc.id,
                                    locationName: loc.name,
                                } as never);
                            }}
                        >
                            <Text>{loc.name}</Text>
                            <Text style={{ color: 'blue', marginTop: 4 }}>View Details</Text>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
});
