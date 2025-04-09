import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'favorites'),
      (snapshot) => {
        const favs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favs);
      }
    );

    return unsubscribe;
  }, [user]);

  const renderItem = ({ item }) => (
    <View style={styles.favoriteCard}>
      <View>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <Ionicons name="heart" size={22} color="#FF9B62" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>add favorites to see{'\n'}them here!</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555F62',
    padding: 20,
    paddingTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  headerBox: {
    backgroundColor: '#3D4447',
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  favoriteCard: {
    backgroundColor: '#6D7579',
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  locationName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
});
