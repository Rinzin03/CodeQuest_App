// ============================================================================
// AUTH SERVICE - FIREBASE PASSWORD RESET & AUTHENTICATION
// ============================================================================

import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sends a password reset email via Firebase Auth.
 */
export async function handleForgotPassword(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else {
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  }
}