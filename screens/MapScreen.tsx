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
const crowdLevelMap = {
  'Not Crowded': 0,
  'Somewhat Crowded': 1,
  'Very Crowded': 2
};

export default function MapScreen() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState<string|null>(null);
    const [region, setRegion] = useState(PSU_REGION);
    const [locations, setLocations] = useState<any[]>([]);
    const [filteredLocations, setFilteredLocations] = useState<any[]>([]);
    const navigation = useNavigation();                             // <-- hook
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [crowdLevel, setCrowdLevel] = useState('');
    const [locationType, setLocationType] = useState('');

    const clearSelections = () => {
      setCrowdLevel('');
      setLocationType('');
    };

    const applyFilters = () => {
      let filtered = [...locations];

      // Filter by crowd level if selected
      if (crowdLevel) {
        const crowdLevelValue = crowdLevelMap[crowdLevel];
        filtered = filtered.filter(loc => loc.crowdLevel === crowdLevelValue);
      }

      // Filter by location type if selected
      if (locationType) {
        filtered = filtered.filter(loc => loc.locationType === locationType);
      }

      // Update filtered locations
      setFilteredLocations(filtered);
      setIsFilterVisible(false);
    };

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
                setFilteredLocations(docs); // Initialize filtered locations with all locations
            },
            err => console.error("Error fetching locations:", err)
        );
        return unsub;
    }, []);

    // Map human-readable crowdLevel to its display label
    const getCrowdLevelLabel = (level) => {
      switch(level) {
        case 0: return 'Not Crowded';
        case 1: return 'Somewhat Crowded';
        case 2: return 'Very Crowded';
        default: return 'Unknown';
      }
    };

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

                {filteredLocations.map(loc => (
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
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{loc.name}</Text>
                                <Text>Crowd Level: {getCrowdLevelLabel(loc.crowdLevel)}</Text>
                                {loc.locationType && <Text>Type: {loc.locationType}</Text>}
                                <Text style={styles.calloutLink}>View Details</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Active Filter Indicator */}
            {(crowdLevel || locationType) && (
                <View style={styles.activeFilterIndicator}>
                    <Text style={styles.activeFilterText}>
                        Filters Active: {crowdLevel && `${crowdLevel}`} {crowdLevel && locationType && '•'} {locationType && `${locationType}`}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            clearSelections();
                            setFilteredLocations(locations);
                        }}
                        style={styles.clearFilterButton}
                    >
                        <Text style={styles.clearFilterText}>×</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setIsFilterVisible(true)}
            >
                <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>

            <Modal
              visible={isFilterVisible}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Filter Menu</Text>

                  <Text style={styles.sectionTitle}>Crowd Level</Text>
                  {['Not Crowded', 'Somewhat Crowded', 'Very Crowded'].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={styles.radioOption}
                      onPress={() => setCrowdLevel(level === crowdLevel ? '' : level)}
                    >
                      <View style={styles.radioCircle}>
                        {crowdLevel === level && <View style={styles.selectedCircle} />}
                      </View>
                      <Text style={styles.radioLabel}>{level}</Text>
                    </TouchableOpacity>
                  ))}

                  <Text style={styles.sectionTitle}>Location Type</Text>
                  {['Gym Space', 'Study Space', 'Dining Space'].map(type => (
                    <TouchableOpacity
                      key={type}
                      style={styles.radioOption}
                      onPress={() => setLocationType(type === locationType ? '' : type)}
                    >
                      <View style={styles.radioCircle}>
                        {locationType === type && <View style={styles.selectedCircle} />}
                      </View>
                      <Text style={styles.radioLabel}>{type}</Text>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.unselectButton} onPress={clearSelections}>
                      <Text style={styles.buttonText}>Un-select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                      <Text style={styles.buttonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },

  calloutContainer: {
    width: 150,
    padding: 5,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 3,
  },
  calloutLink: {
    color: 'blue',
    marginTop: 5,
    textAlign: 'center',
  },

  activeFilterIndicator: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
  },
  clearFilterButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  filterButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FF9B62',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    marginTop: 60,
    marginLeft: 20,
    width: '80%',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'orange',
  },
  radioLabel: {
    color: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  unselectButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});