import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Approximated center for Penn State's campus
const PSU_REGION = {
    latitude: 40.7982,
    longitude: -77.8599,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState(PSU_REGION);

    // Controls the visibility of the filter menu
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
            setRegion({
                ...region,
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });
        })();
    }, []);

    // Toggle the filter overlay
    const toggleFilter = () => {
        setShowFilter(!showFilter);
    };

    return (
        <View style={styles.container}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Map */}
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                showsUserLocation={true}
                showsMyLocationButton={true}
                userInterfaceStyle="dark"
            >
                {location && <Marker coordinate={location} title="Your Location" />}
            </MapView>

            {/* Top-right "Filter" button */}
            <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
                <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>

            {/* Overlay + bottom sheet filter menu */}
            {showFilter && (
                <View style={styles.overlay}>
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterTitle}>Filter Menu</Text>

                        <Text style={styles.sectionTitle}>crowd level</Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.filterOption}>
                                <Text>not crowded</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterOption}>
                                <Text>somewhat crowded</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterOption}>
                                <Text>very crowded</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sectionTitle}>location type</Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.filterOption}>
                                <Text>gym space</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterOption}>
                                <Text>study space</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterOption}>
                                <Text>dining space</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Example row with "un-select all" and "apply" */}
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.filterOption, styles.unselect]}>
                                <Text>un-select all</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.filterOption, styles.apply]}>
                                <Text style={{ color: '#fff' }}>apply</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Close button (top-right "X") */}
                        <TouchableOpacity style={styles.closeButton} onPress={toggleFilter}>
                            <Text style={{ color: '#fff' }}>X</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1 },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },

    // The button that opens the filter menu
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

    // Overlay dims the background map
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },

    // The bottom sheet container
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
