// screens/ReportScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, app } from '../config/firebaseConfig';

// —————— Helpers ——————
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
function getDistanceFromLatLonInMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
      Math.sin(dLat/2)**2 +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function uploadImageAsync(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = uri.split('/').pop()!;
  const storage = getStorage();
  const storageRef = ref(storage, `reports/${filename}`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}
// ———————————————————————

export default function ReportScreen() {
  const auth = getAuth(app);

  const [crowdLevel, setCrowdLevel]         = useState<string|null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [image, setImage]                   = useState<string|null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const [closestLocationName, setClosestLocationName] = useState('Report');
  const [closestLocation, setClosestLocation]         = useState<any>(null);
  const [currentLocation, setCurrentLocation]         = useState<Location.LocationObjectCoords|null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
      const locResult = await Location.getCurrentPositionAsync({});
      setCurrentLocation(locResult.coords);

      try {
        const snapshot = await getDocs(collection(db, 'locations'));
        let minDistance = Infinity;
        let best: any = null;

        snapshot.docs.forEach(doc => {
          const d = doc.data() as any;
          const { latitude: lat, longitude: lon } = d.coordinates;
          if (locResult.coords && lat != null && lon != null) {
            const dist = getDistanceFromLatLonInMeters(
                locResult.coords.latitude,
                locResult.coords.longitude,
                lat, lon
            );
            if (dist < minDistance) {
              minDistance = dist;
              best = { id: doc.id, name: d.name, coordinates: d.coordinates };
            }
          }
        });

        if (best) {
          setClosestLocationName(`Report: ${best.name}`);
          setClosestLocation(best);
        }
      } catch (err) {
        console.error('Error fetching locations: ', err);
      }
    })();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('We need camera permissions to take a picture!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      let photoUrl = '';
      if (image) {
        photoUrl = await uploadImageAsync(image);
      }

      const user     = auth.currentUser;
      const userName = user?.displayName
          || user?.email?.split('@')[0]
          || 'Anonymous';

      await addDoc(collection(db, 'reports'), {
        crowdLevel,
        additionalInfo,
        photoUrl,
        timestamp: serverTimestamp(),
        locationReported: closestLocation || null,
        userId:   user?.uid   || null,
        userName: userName,
      });

      setNotificationVisible(true);
      fadeAnim.setValue(1);
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setNotificationVisible(false));
      }, 2000);

      setCrowdLevel(null);
      setAdditionalInfo('');
      setImage(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report—please try again.');
    }
  };

  const handleCrowdLevelPress = (level: string) => {
    setCrowdLevel(crowdLevel === level ? null : level);
  };

  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{closestLocationName}</Text>

            <View style={styles.crowdContainer}>
              <Text style={styles.subHeader}>How crowded is this location?</Text>
              {['not crowded','somewhat crowded','very crowded'].map(lvl => (
                  <TouchableOpacity
                      key={lvl}
                      style={[
                        styles.button,
                        crowdLevel === lvl && styles.selected
                      ]}
                      onPress={() => handleCrowdLevelPress(lvl)}
                  >
                    <Text style={styles.buttonText}>{lvl.replace(/\b\w/g,c=>c.toUpperCase())}</Text>
                  </TouchableOpacity>
              ))}
            </View>

            <View style={styles.additionalInfoContainer}>
              <Text style={styles.subHeader}>Additional Info:</Text>
              <TextInput
                  style={[styles.input, { fontFamily: 'Actor' }]}
                  placeholder="Further Comments"
                  placeholderTextColor="#888"
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
              />
            </View>

            {!image ? (
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                  <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
                  <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => setImage(null)}
                  >
                    <Text style={styles.deleteText}>X</Text>
                  </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={[
                  styles.submitButton,
                  !crowdLevel && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={!crowdLevel}
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
  // … your existing styles here …
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  content: { padding: 20, marginTop: 40 },
  title: { fontSize: 24, fontWeight: '600', color: '#FFF', textAlign: 'center', marginBottom: 20 },
  subHeader: { fontSize: 16, color: '#CCC', marginBottom: 10 },
  crowdContainer: { marginBottom: 30 },
  button: {
    backgroundColor: '#2C2C2E',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  selected: { backgroundColor: '#FF9B62', borderColor: '#FF9B62' },
  buttonText: { color: '#FFF', textAlign: 'center' },
  additionalInfoContainer: { marginBottom: 30 },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  imageButton: {
    backgroundColor: '#2C2C2E',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  photoContainer: { alignItems: 'center', marginBottom: 20 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 10 },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF5C5C',
    borderRadius: 14,
    padding: 6,
  },
  deleteText: { color: '#FFF', fontWeight: 'bold' },
  submitButton: {
    backgroundColor: '#FF9B62',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#555' },
  submitText: { color: '#1E1E1E', fontWeight: 'bold' },
  notificationOverlay: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center' },
  notificationBox: {
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9B62',
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: { color: '#FF9B62', marginRight: 10 },
  notificationClose: { color: '#FF9B62', fontWeight: 'bold' },
});
