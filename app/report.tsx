import React, { useState, useRef } from 'react';
import { Animated, Keyboard, TouchableWithoutFeedback, View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ReportScreen() {
  const [crowdLevel, setCrowdLevel] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [image, setImage] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to take a picture!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      flashMode: ImagePicker.FlashMode.off,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    console.log({ crowdLevel, additionalInfo, image });
    setNotificationVisible(true);
    fadeAnim.setValue(1);
    // Wait 2 seconds, then fade out over 500ms
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setNotificationVisible(false);
      });
    }, 2000);
  };

  const handleCrowdLevelPress = (level) => {
    setCrowdLevel(crowdLevel === level ? null : level);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Report Screen</Text>

          {/* Crowd Container */}
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

          {/* Additional Info Section */}
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

          {/* Photo Button */}
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
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              !crowdLevel && styles.disabledButton, // Disable when no crowd level is selected
              { elevation: 5, shadowColor: '#000' }, // Raised button effect
            ]}
            onPress={handleSubmit}
            disabled={!crowdLevel}
            activeOpacity={0.8} // Smooth touch effect
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
  submitButton: {
    backgroundColor: '#888',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.6,
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
      elevation: 8, // For Android shadow effect
      transform: [{ scale: 1 }],
    },
    submitButtonPressed: {
      transform: [{ scale: 0.95 }], // Slight press-down effect
    },
    disabledButton: {
      backgroundColor: '#666',
      opacity: 0.6,
      shadowOpacity: 0, // Remove shadow when disabled
    },
});
