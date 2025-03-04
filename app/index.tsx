import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

    return (
        <View style={styles.container}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
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
});
