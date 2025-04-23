// screens/MapScreen.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';         // <-- React Navigation
import { db } from '../config/firebaseConfig';
import { Modal } from 'react-native';

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
    const [isFilterVisible, setIsFilterVisible] = useState(false);

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
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(true)}
            >
                <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isFilterVisible}
                onRequestClose={() => setIsFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filter Options</Text>
                        {/* Put your filter controls here */}
                        <TouchableOpacity onPress={() => setIsFilterVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 },

    // 🔽 Add your new styles here:
    filterButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
        zIndex: 10,
    },
    filterButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 15,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 6,
    },
    closeButtonText: {
        color: 'white',
    },
});

});
