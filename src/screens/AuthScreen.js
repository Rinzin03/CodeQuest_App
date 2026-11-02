import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters.');
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      Alert.alert('Authentication Error', error.message);
    }
  };

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Enter your email address to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CodeQuest 🐉</Text>
      <Text style={styles.subtitle}>A Gamified Python Learning App</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </Text>
      </TouchableOpacity>

      {isLogin && (
        <TouchableOpacity onPress={handleReset} style={{ marginTop: 15 }}>
          <Text style={styles.resetText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#FFF9E6' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 30 },
  input: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', marginBottom: 15 },
  button: { backgroundColor: '#FFD166', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  switchText: { textAlign: 'center', color: '#007AFF', marginTop: 20 },
  resetText: { textAlign: 'center', color: '#666', textDecorationLine: 'underline' }
});