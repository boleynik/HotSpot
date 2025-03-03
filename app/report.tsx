import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ReportScreen() {
  const [crowdLevel, setCrowdLevel] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    // Here you can handle form submission, e.g., sending data to a server.
    console.log({ crowdLevel, additionalInfo, image });
  };

  return (
    <View style={styles.container}>
      {/* Original snippet header */}
      <Text style={styles.title}>Report Screen</Text>

      <Text style={styles.subHeader}>How crowded is this location?</Text>
      <TouchableOpacity
        style={[styles.button, crowdLevel === 'not crowded' && styles.selected]}
        onPress={() => setCrowdLevel('not crowded')}
      >
        <Text style={styles.buttonText}>Not Crowded</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, crowdLevel === 'somewhat crowded' && styles.selected]}
        onPress={() => setCrowdLevel('somewhat crowded')}
      >
        <Text style={styles.buttonText}>Somewhat Crowded</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, crowdLevel === 'very crowded' && styles.selected]}
        onPress={() => setCrowdLevel('very crowded')}
      >
        <Text style={styles.buttonText}>Very Crowded</Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>Additional Info:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter additional info"
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
      />

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Add Photo</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Merged/updated styles combining the original snippet and new UI styles
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 10
  },
  button: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  selected: {
    backgroundColor: '#666'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  imageButton: {
    backgroundColor: '#555',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10
  },
  submitButton: {
    backgroundColor: '#888',
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18
  },
});
