// ============================================================================
// USER SERVICE - STATS, WEEKLY XP GRAPH, TROPHIES & TOPIC MASTERY SYNC
// Handles atomic Firestore updates for user progress across quests, XP, 
// weekly graph breakdown, and topic mastery.
// ============================================================================

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Checks elapsed time since the user last lost a heart and restores hearts 
 * automatically based on a 5-minute interval per heart.
 */
export async function checkAndRestoreHearts() {
  const userId = auth.currentUser?.uid;
  if (!userId) return 5;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return 5;

  const userData = userSnap.data();
  const currentHearts = userData.hearts ?? 5;
  const maxHearts = 5;

  if (currentHearts >= maxHearts) {
    return maxHearts;
  }

  const lastHeartLossTime = userData.lastHeartLossTime;
  if (!lastHeartLossTime) {
    return currentHearts;
  }

  const now = Date.now();
  const elapsedMs = now - lastHeartLossTime;
  const regenIntervalMs = 5 * 60 * 1000; // 5 minutes per heart

  const heartsToAdd = Math.floor(elapsedMs / regenIntervalMs);

  if (heartsToAdd > 0) {
    const updatedHearts = Math.min(maxHearts, currentHearts + heartsToAdd);
    const remainingTimeOffset = elapsedMs % regenIntervalMs;
    const newTimestamp = now - remainingTimeOffset;

    await updateDoc(userRef, {
      hearts: updatedHearts,
      lastHeartLossTime: updatedHearts === maxHearts ? null : newTimestamp
    });

    return updatedHearts;
  }

  return currentHearts;
}

/**
 * Updates general user stats, weekly XP graph, topic mastery, and trophies atomically.
 * @param {Object} stats - Object containing raw numbers for xp, points, completedQuests, etc.
 * @param {string} topicId - The topic identifier being practiced/completed (e.g., 'topic_1').
 * @param {number} earnedXp - The specific XP earned during this session (defaults to 20).
 */
export async function updateUserStats(stats, topicId = null, earnedXp = 20) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  // Fetch current user data to compute accurate numerical increments
  const currentData = userSnap.exists() ? userSnap.data() : {};
  
  // Extract clean numerical values to avoid FieldValue increment calculation bugs
  const existingQuests = currentData.completedQuests || 0;
  const addedQuests = stats.completedQuests?.numberValue || 1;
  const newTotalQuests = existingQuests + addedQuests;

  let updatePayload = { 
    ...stats,
    completedQuests: newTotalQuests // Store absolute numerical total
  };

  // ==========================================================================
  // 1. HEART LOSS TIMESTAMP MANAGEMENT
  // ==========================================================================
  if (stats.hearts !== undefined) {
    const oldHearts = currentData.hearts ?? 5;
    if (stats.hearts < oldHearts) {
      updatePayload.lastHeartLossTime = Date.now();
    } else if (stats.hearts >= 5) {
      updatePayload.lastHeartLossTime = null;
    }
  }

  // ==========================================================================
  // 2. WEEKLY XP GRAPH BREAKDOWN (Monday to Sunday)
  // ==========================================================================
  let weeklyXp = [...(currentData.weeklyXp || [0, 0, 0, 0, 0, 0, 0])];
  const jsDay = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const graphIndex = (jsDay + 6) % 7; // Maps to Monday=0 ... Sunday=6
  weeklyXp[graphIndex] = (weeklyXp[graphIndex] || 0) + earnedXp;
  updatePayload.weeklyXp = weeklyXp;

  // ==========================================================================
  // 3. TOPIC MASTERY & PROGRESS TRACKING
  // ==========================================================================
  if (topicId) {
    const existingProgress = currentData.topicProgress || {};
    const currentTopicData = existingProgress[topicId] || { completedQuests: 0, masteryLevel: 'In Progress' };
    
    const newCompletedQuests = currentTopicData.completedQuests + 1;
    // 3 completed sessions fully masters a topic (100%)
    const masteryPercentage = Math.min(100, Math.round((newCompletedQuests / 3) * 100));

    updatePayload[`topicProgress.${topicId}`] = {
      completedQuests: newCompletedQuests,
      masteryLevel: masteryPercentage >= 100 ? 'Mastered' : 'In Progress',
      percentage: masteryPercentage
    };
  }

  // ==========================================================================
  // 4. AUTOMATIC TROPHY / BADGE UNLOCKING
  // ==========================================================================
  let trophies = [...(currentData.trophies || [])];
  if (newTotalQuests >= 1 && !trophies.includes('First steps')) {
    trophies.push('First steps');
  }
  updatePayload.trophies = trophies;

  // ==========================================================================
  // 5. FIRESTORE COMMIT
  // ==========================================================================
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: 'Adventurer',
      xp: 0,
      points: 0,
      completedQuests: 0,
      hearts: 5,
      streak: 1,
      trophies: trophies,
      topicProgress: {},
      weeklyXp: weeklyXp,
      lastHeartLossTime: null,
      ...updatePayload
    });
  } else {
    await updateDoc(userRef, updatePayload);
  }
}