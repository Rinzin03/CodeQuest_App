// ============================================================================
// CODEQUEST - FORGOT PASSWORD SCREEN
// Allows users to input their registered email and triggers a Firebase 
// password reset link directly to their inbox.
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { handleForgotPassword } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Trigger password reset request via Firebase Auth service
  const onSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      await handleForgotPassword(email);
      
      Alert.alert(
        'Email Sent! 📧',
        `A password reset link has been sent to ${email.trim()}. Please check your inbox.`,
        [
          {
            text: 'Back to Login',
            onPress: () => navigation.goBack() // Returns user to login screen
          }
        ]
      );
    } catch (error) {
      Alert.alert('Reset Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          
          {/* Back button to return to Auth screen */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#1F1F1F" />
          </TouchableOpacity>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your CodeQuest account, and we'll send you a link to reset your password.
          </Text>

          {/* Email input field */}
          <Text style={styles.inputLabel}>Registered Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="adventurer@codequest.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          {/* Submit action button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onSendResetLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Link →</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

// ============================================================================
// STYLESHEET (Neubrutalism Design Theme)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD166',
    borderWidth: 2,
    borderColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    lineHeight: 18,
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F1F1F',
    marginBottom: 6
  },
  textInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 20
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    alignItems: 'center'
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFF'
  }
});