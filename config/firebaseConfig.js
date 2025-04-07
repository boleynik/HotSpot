import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCIJJHHckxoSr1GbcTJn98XoCvG0nq30_I",
    authDomain: "hotspot-23d7a.firebaseapp.com",
    databaseURL: "https://hotspot-23d7a.firebaseio.com",
    projectId: "hotspot-23d7a",
    storageBucket: "hotspot-23d7a.firebasestorage.app", // STORAGE BUCKET
    messagingSenderId: "549306917744",
    appId: "1:549306917744:web:81926ac15adb2ffa55e5b5",
    measurementId: "G-1QNPZECEDT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For more information on accessing Firebase in your project, see:
// https://firebase.google.com/docs/web/setup
