import { useState, useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import auth from '@react-native-firebase/auth';

export default function Layout() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) return null;

    return user ? <Redirect href="/home" /> : <Redirect href="/login" />;
}