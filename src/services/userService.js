// ============================================================================
// USER SERVICE - STATS, TOPIC MASTERY, TROPHIES & PERSISTENT HEART RECOVERY
// ============================================================================
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * Checks elapsed time since the user last lost a heart and restores hearts 
 * automatically based on a 5-minute (300,000ms) interval per heart.
 */
export async function checkAndRestoreHearts() {
  const userId = auth.currentUser?.uid;
  if (!userId) return 5; // Default fallback if unauthenticated

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return 5;

  const userData = userSnap.data();
  const currentHearts = userData.hearts ?? 5;
  const maxHearts = 5;

  // If hearts are already full, no need to calculate timers
  if (currentHearts >= maxHearts) {
    return maxHearts;
  }

  const lastHeartLossTime = userData.lastHeartLossTime;
  if (!lastHeartLossTime) {
    return currentHearts;
  }

  const now = Date.now();
  const elapsedMs = now - lastHeartLossTime;
  const regenIntervalMs = 5 * 60 * 1000; // 5 minutes per heart (adjust to 25 mins if 1 heart per 25 mins: 25 * 60 * 1000)

  // Calculate how many hearts should be restored based on elapsed time
  const heartsToAdd = Math.floor(elapsedMs / regenIntervalMs);

  if (heartsToAdd > 0) {
    const updatedHearts = Math.min(maxHearts, currentHearts + heartsToAdd);
    // Advance the baseline timestamp by the exact time consumed by the restored hearts
    const remainingTimeOffset = elapsedMs % regenIntervalMs;
    const newTimestamp = now - remainingTimeOffset;

    // Update Firestore with new hearts and adjusted timer baseline
    await updateDoc(userRef, {
      hearts: updatedHearts,
      lastHeartLossTime: updatedHearts === maxHearts ? null : newTimestamp
    });

    return updatedHearts;
  }

  return currentHearts;
}

/**
 * Updates general user statistics atomically using Firestore increment.
 */
export async function updateUserStats(stats, topicId = null) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  let updatePayload = { ...stats };

  // If hearts are being reduced (losing a heart), record the current timestamp
  if (stats.hearts !== undefined) {
    const currentData = userSnap.exists() ? userSnap.data() : {};
    const oldHearts = currentData.hearts ?? 5;
    
    // Check if a heart was actually lost
    if (stats.hearts < oldHearts) {
      updatePayload.lastHeartLossTime = Date.now();
    } else if (stats.hearts >= 5) {
      // Clear timestamp if hearts are restored to full
      updatePayload.lastHeartLossTime = null;
    }
  }

  // Handle topic mastery updates if topicId is supplied
  if (topicId) {
    const currentData = userSnap.exists() ? userSnap.data() : {};
    const existingProgress = currentData.topicProgress || {};
    const currentTopicCompleted = (existingProgress[topicId]?.completedQuests || 0) + 1;

    updatePayload[`topicProgress.${topicId}`] = {
      completedQuests: currentTopicCompleted,
      masteryLevel: currentTopicCompleted >= 3 ? 'Mastered' : 'In Progress',
    };
  }

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: 'Adventurer',
      xp: 0,
      points: 0,
      completedQuests: 0,
      hearts: 5,
      streak: 1,
      trophies: ['First Quest', 'Python Beginner'],
      topicProgress: {},
      lastHeartLossTime: null,
      ...updatePayload
    });
  } else {
    await updateDoc(userRef, updatePayload);
  }
}