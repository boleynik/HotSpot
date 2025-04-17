import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { app } from '../config/firebaseConfig';

export default function SignupScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const auth       = getAuth(app);

    const handleSignup = async () => {
        if (!username.trim() || !email.trim() || !password) {
            return Alert.alert('Missing Fields','All fields are required.');
        }
        if (!email.endsWith('@psu.edu')) {
            return Alert.alert('Invalid Email','Please use your @psu.edu email.');
        }
        try {
            const cred = await createUserWithEmailAndPassword(
                auth, email.trim(), password
            );
            // Save the username as displayName
            await updateProfile(cred.user, { displayName: username.trim() });
            navigation.replace('HomeTabs');
        } catch (error: any) {
            console.error('Signup error:', error);
            let msg = 'Signup failed. Please try again.';
            if (error.code === 'auth/email-already-in-use')
                msg = 'That email is already registered.';
            if (error.code === 'auth/weak-password')
                msg = 'Password needs at least 6 characters.';
            if (error.code === 'auth/invalid-email')
                msg = 'Invalid email address.';
            Alert.alert('Signup Error', msg);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Hotspot Sign Up</Text>

            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
            />

            <TextInput
                style={styles.input}
                placeholder="Email (@psu.edu)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password (min 6 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.replace('Login')}
                style={styles.footerLink}
            >
                <Text style={styles.footerText}>
                    Already have an account? <Text style={styles.footerBold}>Sign In</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

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
    loginLink: {
        marginTop: 20,
    },
    loginText: {
        color: '#555',
    },
    loginTextBold: {
        color: '#FF9B62',
        fontWeight: 'bold',
    },
});
