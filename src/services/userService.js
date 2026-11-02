// Import Firestore database instance and Auth service from your configuration file
import { db, auth } from './firebase';
// Import Firestore functions to reference documents, read data, create/overwrite documents, update fields, and increment numbers atomically
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

// Helper function to safely ensure a user profile exists in Firestore before updating their stats (prevents "No document to update" errors)
export async function updateUserStats(stats) {
  // Retrieve the unique ID of the currently logged-in user
  const userId = auth.currentUser?.uid;
  if (!userId) return; // Exit early if no user is authenticated

  // Create a document reference pointing to the user's document inside the 'users' collection
  const userRef = doc(db, 'users', userId);
  // Fetch the current document snapshot from Firestore
  const userSnap = await getDoc(userRef);

  // Check if the user document does not exist yet (e.g., fresh start / first-time user)
  if (!userSnap.exists()) {
    // Create and initialize the user document with default starting values combined with any passed stats
    await setDoc(userRef, {
      name: 'Adventurer',
      xp: 0,
      points: 0,
      completedQuests: 0,
      hearts: 5,
      streak: 1,
      topicProgress: {},
      ...stats
    });
  } else {
    // If the user document already exists, safely update the fields with the new stats
    await updateDoc(userRef, stats);
  }
}