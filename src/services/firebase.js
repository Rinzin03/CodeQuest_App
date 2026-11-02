import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAyaof_1qG01tlWRvLlsU8pI-4FxjuNPCM",
  authDomain: "codequest-2e4c6.firebaseapp.com",
  projectId: "codequest-2e4c6",
  storageBucket: "codequest-2e4c6.firebasestorage.app",
  messagingSenderId: "550494254561",
  appId: "1:550494254561:web:14a3543714f2e729894ea0",
  measurementId: "G-KWEP2WMDSG"
};

// 1. Initialize Firebase safely (prevents duplicate app initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth safely with persistence (prevents hot-reload crashes)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

// 3. Initialize Firestore
const db = getFirestore(app);

export { auth, db };