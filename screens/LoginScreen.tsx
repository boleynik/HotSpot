import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../config/firebaseConfig';

export default function LoginScreen() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const auth       = getAuth(app);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            return Alert.alert('Missing Fields','Please enter both email and password.');
        }
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            // Reset to the tab navigator
            navigation.replace('HomeTabs');
        } catch (error: any) {
            console.error('Login error:', error);
            let msg = 'Login failed. Please try again.';
            if (error.code === 'auth/user-not-found') msg = 'No account for that email.';
            if (error.code === 'auth/wrong-password')  msg = 'Incorrect password.';
            if (error.code === 'auth/invalid-email')   msg = 'Invalid email address.';
            Alert.alert('Login Failed', msg);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hotspot Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.replace('Signup')}
                style={styles.footerLink}
            >
                <Text style={styles.footerText}>
                    Don’t have an account? <Text style={styles.footerBold}>Sign Up</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ... your existing styles here ...

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#FF9B62',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signUpLink: {
        marginTop: 20,
    },
    signUpText: {
        color: '#555',
    },
    signUpTextBold: {
        color: '#FF9B62',
        fontWeight: 'bold',
    },
});
