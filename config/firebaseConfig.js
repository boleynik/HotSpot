import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCIJJHHckxoSr1GbcTJn98XoCvG0nq30_I",
    authDomain: "hotspot-23d7a.firebaseapp.com",
    databaseURL: "https://hotspot-23d7a.firebaseio.com",
    projectId: "hotspot-23d7a",
    storageBucket: "hotspot-23d7a.firebasestorage.app", // double-check this value in Firebase console
    messagingSenderId: "549306917744",
    appId: "1:549306917744:web:81926ac15adb2ffa55e5b5",
    measurementId: "G-1QNPZECEDT"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence using AsyncStorage
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);
