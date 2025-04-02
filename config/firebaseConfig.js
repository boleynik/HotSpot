import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCIJJHHckxoSr1GbcTJn98XoCvG0nq30_I",
    authDomain: "hotspot-23d7a.firebaseapp.com",
    databaseURL: 'https://hotspot-23d7a.firebaseio.com',
    projectId: "hotspot-23d7a",
    storageBucket: "hotspot-23d7a.firebasestorage.app",
    messagingSenderId: "549306917744",
    appId: "1:549306917744:web:81926ac15adb2ffa55e5b5",
    measurementId: "G-1QNPZECEDT"
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
