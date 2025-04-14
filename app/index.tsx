import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig.js'; // Adjust the path to your firebase config
import { useRouter } from 'expo-router'; // For navigation

// Reanimated Bottom Sheet (Filter overlay remains as your existing code)
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Approximated center for Penn State's campus
const PSU_REGION = {
    latitude: 40.7982,
    longitude: -77.8599,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

const { width } = Dimensions.get('window');

// Map crowd level to marker color
const crowdColors = {
    0: 'green',
    1: 'yellow',
    2: 'red',
};

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState(PSU_REGION);
    const [locations, setLocations] = useState([]);
    const [showFilter, setShowFilter] = useState(false);

    // BottomSheet ref and snap points (for your filter overlay)
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['40%', '80%'], []);

    // Router for navigation
    const router = useRouter();

    // Request location permissions and update region/user location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
            setRegion((prev) => ({
                ...prev,
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            }));
        })();
    }, []);

    // Listen for changes in the "locations" collection (Realtime updates)
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'locations'), (querySnapshot) => {
            const locs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLocations(locs);
        }, (error) => {
            console.error("Error fetching locations:", error);
        });
        return () => unsubscribe();
    }, []);

    // Toggle the filter overlay (existing implementation)
    const toggleFilter = () => {
        setShowFilter((prev) => !prev);
    };

    // For debugging: function to open the bottom sheet (if using reanimated bottom sheet)
    const openFilterSheet = useCallback(() => {
        bottomSheetRef.current?.snapToIndex(0);
    }, []);

    const closeFilterSheet = () => {
        bottomSheetRef.current?.close();
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

                {/* Map covering the full screen */}
                <MapView
                    style={StyleSheet.absoluteFillObject}
                    region={region}
                    onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    userInterfaceStyle="dark"
                >
                    {/* User's current location marker */}
                    {location && <Marker coordinate={location} title="Your Location" />}

                    {/* Markers from Firestore "locations" collection */}
                    {locations.map((loc) => (
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
                                    // Navigate to detailedView, passing locationId and name
                                    router.push({
                                        pathname: '/detailedView',
                                        params: { locationId: loc.id, locationName: loc.name },
                                    });
                                }}
                            >
                                <Text>{loc.name}</Text>
                                <Text style={{ color: 'blue', marginTop: 4 }}>View Details</Text>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>

                {/* Top-right "Filter" button (to toggle overlay) */}
                <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
                    <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>

                {/* Filter Overlay (existing implementation) */}
                {showFilter && (
                    <View style={styles.overlay}>
                        <View style={styles.filterContainer}>
                            <Text style={styles.filterTitle}>Filter Menu</Text>

                            <Text style={styles.sectionTitle}>Crowd Level</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={styles.filterOption}>
                                    <Text>Not Crowded</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterOption}>
                                    <Text>Somewhat Crowded</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterOption}>
                                    <Text>Very Crowded</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionTitle}>Location Type</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={styles.filterOption}>
                                    <Text>Gym Space</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterOption}>
                                    <Text>Study Space</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterOption}>
                                    <Text>Dining Space</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.filterOption, styles.unselect]}>
                                    <Text>Un-select All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.filterOption, styles.apply]}>
                                    <Text style={{ color: '#fff' }}>Apply</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Close button for filter overlay */}
                            <TouchableOpacity style={styles.closeButton} onPress={toggleFilter}>
                                <Text style={{ color: '#fff' }}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    // Filter Button Styles
    filterButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: '#F8B36C',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Overlay for filter menu
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    // Filter Container (bottom sheet-like overlay)
    filterContainer: {
        backgroundColor: '#F8B36C',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 20,
    },
    filterTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    filterOption: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginRight: 5,
        marginBottom: 5,
    },
    unselect: {
        backgroundColor: '#ffe0b2',
    },
    apply: {
        backgroundColor: '#333',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 20,
        backgroundColor: '#333',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
