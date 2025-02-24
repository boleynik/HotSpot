import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';

// Approximated campus center and region
const PSU_REGION = {
    latitude: 40.7982,     // Approximate center latitude
    longitude: -77.8599,   // Approximate center longitude
    latitudeDelta: 0.02,   // Adjust for desired zoom level
    longitudeDelta: 0.02,
};

// Define the campus boundaries (approximations)
const PSU_BOUNDARIES_NORTH = 40.8030;
const PSU_BOUNDARIES_SOUTH = 40.7935;
const PSU_BOUNDARIES_EAST  = -77.8520;
const PSU_BOUNDARIES_WEST  = -77.8675;

// Define polygons to darken areas outside of PSU boundaries
const outsidePolygons = [
    // Polygon for the area north of campus
    [
        { latitude: 90, longitude: -180 },
        { latitude: 90, longitude: 180 },
        { latitude: PSU_BOUNDARIES_NORTH, longitude: 180 },
        { latitude: PSU_BOUNDARIES_NORTH, longitude: -180 },
    ],
    // Polygon for the area south of campus
    [
        { latitude: -90, longitude: -180 },
        { latitude: -90, longitude: 180 },
        { latitude: PSU_BOUNDARIES_SOUTH, longitude: 180 },
        { latitude: PSU_BOUNDARIES_SOUTH, longitude: -180 },
    ],
    // Polygon for the area east of campus
    [
        { latitude: PSU_BOUNDARIES_NORTH, longitude: PSU_BOUNDARIES_EAST },
        { latitude: PSU_BOUNDARIES_SOUTH, longitude: PSU_BOUNDARIES_EAST },
        { latitude: PSU_BOUNDARIES_SOUTH, longitude: 180 },
        { latitude: PSU_BOUNDARIES_NORTH, longitude: 180 },
    ],
    // Polygon for the area west of campus
    [
        { latitude: PSU_BOUNDARIES_NORTH, longitude: -180 },
        { latitude: PSU_BOUNDARIES_SOUTH, longitude: -180 },
        { latitude: PSU_BOUNDARIES_SOUTH, longitude: PSU_BOUNDARIES_WEST },
        { latitude: PSU_BOUNDARIES_NORTH, longitude: PSU_BOUNDARIES_WEST },
    ],
];

const MapScreen = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState(PSU_REGION);

    useEffect(() => {
        (async () => {
            // Request permission to access location
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Get current user location
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
            // Optionally, update the map region to center on the user's location
            setRegion({
                ...region,
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });
        })();
    }, []);

    return (
        <View style={styles.container}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {location && <Marker coordinate={location} title="Your Location" />}
                {/* Overlay polygons to darken areas outside the PSU campus */}
                {outsidePolygons.map((polygon, index) => (
                    <Polygon
                        key={index}
                        coordinates={polygon}
                        fillColor="rgba(0, 0, 0, 0.3)"
                        strokeWidth={0}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
});

export default MapScreen;
