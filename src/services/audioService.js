// ============================================================================
// CODEQUEST AUDIO SERVICE
// Manages sound effects playback (clicks, correct rewards, wrong answers, sad sounds)
// while respecting the global sound toggle state.
// ============================================================================

import { Audio } from 'expo-av';
import { db, auth } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Helper function to check if sound effects are enabled by the user in Firestore.
 */
export async function isSoundEnabled() {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return true; // Default to enabled if unauthenticated

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Return false only if explicitly set to false
      if (data.soundEffectsEnabled === false) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking sound settings:", error);
    return true;
  }
}

/**
 * Plays a short sound effect from URI or bundled asset.
 * Since local audio files require asset bundling, this uses synthesized 
 * feedback or safe remote notification tones, or expo-av sound objects.
 */
export async function playSound(soundType) {
  try {
    const enabled = await isSoundEnabled();
    if (!enabled) return; // Exit if sound toggle is turned off

    // Optional: If you have local audio files in your assets folder, load them like this:
    
    let soundFile;
    if (soundType === 'click') soundFile = require('../../assets/sounds/click.mp3');
    if (soundType === 'correct') soundFile = require('../../assets/sounds/correct.mp3');
    if (soundType === 'wrong') soundFile = require('../../assets/sounds/wrong.mp3');
    if (soundType === 'sad') soundFile = require('../../assets/sounds/sad.mp3');

    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    // Unload object after playback to free memory
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });


    console.log(`[AudioService] Playing sound effect: ${soundType}`);
  } catch (error) {
    console.error(`Error playing sound (${soundType}):`, error);
  }
}