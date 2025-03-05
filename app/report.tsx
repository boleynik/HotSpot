import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ReportScreen() {
  const [crowdLevel, setCrowdLevel] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [image, setImage] = useState(null);

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
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    console.log({ crowdLevel, additionalInfo, image });
  };

  const handleCrowdLevelPress = (level) => {
    setCrowdLevel(crowdLevel === level ? null : level);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Report Screen</Text>

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

          {/* Added extra margin to separate the additional info section */}
          <View style={styles.additionalInfoContainer}>
            <Text style={styles.subHeader}>Additional Info:</Text>
            <TextInput
              style={[styles.input, { fontFamily: 'Actor' }]}
              placeholder="Further Comments..."
              placeholderTextColor="#888"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              blurOnSubmit={true}
            />
          </View>

          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.image} />}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
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
    marginTop: 70, // Moves the entire content down
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Actor'
  },
  subHeader: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 10,
    fontFamily: 'Actor'
  },
  button: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: '#FF9B62'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Actor'
  },
  additionalInfoContainer: {
    marginTop: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontFamily: 'Actor'
  },
  imageButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#888',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Actor'
  },
});
