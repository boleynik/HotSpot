import React, { useState, useEffect } from 'react';
import { Animated, Keyboard, TouchableWithoutFeedback, View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebaseConfig'; // Adjust path accordingly

// Helper function to calculate distance between two coordinates in meters (Haversine formula)
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // radius of the Earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Helper function to upload an image to Firebase Storage
async function uploadImageAsync(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = uri.split('/').pop();
  const storage = getStorage();
  const storageRef = ref(storage, `reports/${filename}`);
  await uploadBytes(storageRef, blob);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// Define your Firestore "locations" collection entries are expected to have a GeoPoint "coordinates"
// and fields "name", "crowdLevel", etc.
export default function ReportScreen() {
  // Report input states
  const [crowdLevel, setCrowdLevel] = useState<string | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  // State for the report title and the closest location object
  const [closestLocationName, setClosestLocationName] = useState<string>('Report');
  const [closestLocation, setClosestLocation] = useState<{ id: string; name: string; coordinates: any } | null>(null);

  // State for user's current location (for calculating closest location)
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);

  // Request user location and determine the closest location from Firestore
  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      const locResult = await Location.getCurrentPositionAsync({});
      setCurrentLocation(locResult.coords);

      try {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        let closest = null;
        let minDistance = Infinity;
        let closestObj = null;

        querySnapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Since coordinates are stored as a GeoPoint, destructure as an object
          const { latitude: lat, longitude: lon } = data.coordinates;
          if (locResult.coords && lat != null && lon != null) {
            const distance = getDistanceFromLatLonInMeters(
                locResult.coords.latitude,
                locResult.coords.longitude,
                lat,
                lon
            );
            if (distance < minDistance) {
              minDistance = distance;
              closest = data.name;
              closestObj = {
                id: doc.id,
                name: data.name,
                coordinates: data.coordinates,
              };
            }
          }
        });

        if (closest) {
          setClosestLocationName(`Report: ${closest}`);
          setClosestLocation(closestObj);
        } else {
          setClosestLocationName('Report');
        }
      } catch (error) {
        console.error("Error fetching locations: ", error);
      }
    })();
  }, []);

  // Handle photo capture using expo-image-picker
  const takePhoto = async () => {
    console.log("takePhoto function called");
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log("Camera permission status:", status);
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take a picture!');
      return;
    }
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      console.log("Camera result:", JSON.stringify(result));
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        console.log("Image URI set:", result.assets[0].uri);
      } else {
        console.log("User canceled the camera or no image was returned.");
      }
    } catch (error) {
      console.error("Error launching camera:", error);
    }
  };

  // Handle submission: upload image (if any) and create a report document in Firestore
  const handleSubmit = async () => {
    try {
      let photoUrl = '';
      if (image) {
        photoUrl = await uploadImageAsync(image);
      }
      // Create the report document, including the reported location details if available
      await addDoc(collection(db, "reports"), {
        crowdLevel,
        additionalInfo,
        photoUrl,
        timestamp: serverTimestamp(),
        locationReported: closestLocation || null, // Save the entire closest location object
        // Optionally, you can add userId if using Firebase Auth
      });
      console.log("Report submitted successfully!");
      setNotificationVisible(true);
      fadeAnim.setValue(1);
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setNotificationVisible(false);
        });
      }, 2000);
      // Clear the fields
      setCrowdLevel(null);
      setAdditionalInfo('');
      setImage(null);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("There was an error submitting your report. Please try again.");
    }
  };

  const handleCrowdLevelPress = (level: string) => {
    setCrowdLevel(crowdLevel === level ? null : level);
  };

  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Title includes the closest location name */}
            <Text style={styles.title}>{closestLocationName}</Text>

            {/* Crowd Level Selection */}
            <View style={styles.crowdContainer}>
              <Text style={styles.subHeader}>How crowded is this location?</Text>
              <TouchableOpacity
                  style={[styles.button, crowdLevel === 'not crowded' && styles.selected]}
                  onPress={() => handleCrowdLevelPress('not crowded')}
              >
                <Text style={styles.buttonText}>Not Crowded</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.button, crowdLevel === 'somewhat crowded' && styles.selected]}
                  onPress={() => handleCrowdLevelPress('somewhat crowded')}
              >
                <Text style={styles.buttonText}>Somewhat Crowded</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.button, crowdLevel === 'very crowded' && styles.selected]}
                  onPress={() => handleCrowdLevelPress('very crowded')}
              >
                <Text style={styles.buttonText}>Very Crowded</Text>
              </TouchableOpacity>
            </View>

            {/* Additional Info Input */}
            <View style={styles.additionalInfoContainer}>
              <Text style={styles.subHeader}>Additional Info:</Text>
              <TextInput
                  style={[styles.input, { fontFamily: 'Actor' }]}
                  placeholder="Further Comments"
                  placeholderTextColor="#888"
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
                  blurOnSubmit={true}
              />
            </View>

            {/* Photo Section */}
            {!image ? (
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.photoContainer}>
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <Text style={styles.buttonText}>Your Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => setImage(null)}>
                    <Text style={styles.deleteText}>X</Text>
                  </TouchableOpacity>
                  {image && <Image source={{ uri: image }} style={styles.previewImage} />}
                </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                  styles.submitButton,
                  !crowdLevel && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={!crowdLevel}
                activeOpacity={0.8}
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>

          {notificationVisible && (
              <View style={styles.notificationOverlay}>
                <Animated.View style={[styles.notificationBox, { opacity: fadeAnim }]}>
                  <Text style={styles.notificationText}>Report submitted</Text>
                  <TouchableOpacity onPress={() => setNotificationVisible(false)}>
                    <Text style={styles.notificationClose}>X</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
          )}
        </View>
      </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  content: {
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Actor',
  },
  crowdContainer: {
    marginVertical: 25,
  },
  subHeader: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 10,
    fontFamily: 'Actor',
  },
  button: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: '#FF9B62',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Actor',
  },
  additionalInfoContainer: {
    marginTop: 25,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontFamily: 'Actor',
  },
  imageButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#FF9B62',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    marginLeft: 10,
    padding: 10,
  },
  deleteText: {
    color: '#FF9B62',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginLeft: 10,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#FF9B62',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#FF9B62',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.6,
    shadowOpacity: 0,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Actor',
  },
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBox: {
    width: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9B62',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Actor',
  },
  notificationClose: {
    color: '#FF9B62',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Actor',
  },
});
