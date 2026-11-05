// ============================================================================
// CODEQUEST USER SERVICE - TOPIC MASTERY & SEQUENTIAL UNLOCKING SYNC
// Handles atomic Firestore updates for XP, Quest counts, stars, topic mastery,
// weekly graph arrays, and automatic sequential topic unlocking.
// ============================================================================

import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Normalizes topic identifiers to standard Firestore keys (e.g., 'topic_1', 'topic_2')
 */
function normalizeTopicId(topicInput) {
  if (!topicInput) return 'topic_1';
  const str = String(topicInput).toLowerCase().trim();
  
  if (str.includes('1') || str.includes('hello')) return 'topic_1';
  if (str.includes('2') || str.includes('variable')) return 'topic_2';
  if (str.includes('3') || str.includes('conditional')) return 'topic_3';
  if (str.includes('4') || str.includes('loop')) return 'topic_4';
  if (str.includes('5') || str.includes('function')) return 'topic_5';
  
  return topicInput; // Fallback to raw string if already formatted
}

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

  if (currentHearts >= maxHearts) return maxHearts;

  const lastHeartLossTime = userData.lastHeartLossTime;
  if (!lastHeartLossTime) return currentHearts;

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
 * Updates user statistics in Firestore upon quest completion.
 * Tracks mode completions (Quiz, Output Prediction, Bug-Fix), unlocks sequential topics,
 * and automatically plots earned XP into the correct weekday index (Mon-Sun).
 */
export async function updateUserStats(stats, rawTopicId = null, challengeMode = null, earnedXp = 20, sessionStars = 3) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const topicId = normalizeTopicId(rawTopicId);
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  const currentData = userSnap.exists() ? userSnap.data() : {};
  const existingQuests = currentData.completedQuests || 0;
  const newTotalQuests = existingQuests + 1;

  let updatePayload = { 
    ...stats,
    completedQuests: newTotalQuests
  };

  // 1. HEART LOSS TIMESTAMP MANAGEMENT
  if (stats.hearts !== undefined) {
    const oldHearts = currentData.hearts ?? 5;
    if (stats.hearts < oldHearts) {
      updatePayload.lastHeartLossTime = Date.now();
    } else if (stats.hearts >= 5) {
      updatePayload.lastHeartLossTime = null;
    }
  }

  // ============================================================================
  // 2. AUTOMATIC WEEKLY XP GRAPH BREAKDOWN (Monday to Sunday)
  // Maps JS getDay() (0=Sun, 1=Mon...6=Sat) to a Monday-starting array (0=Mon...6=Sun)
  // Ensures bars dynamically increase on the exact current day of the week.
  // ============================================================================
  let weeklyXp = [...(currentData.weeklyXp || [0, 0, 0, 0, 0, 0, 0])];
  const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const graphIndex = (jsDay + 6) % 7; // Shifts Sunday (0) to index 6, Monday (1) to index 0
  
  weeklyXp[graphIndex] = (weeklyXp[graphIndex] || 0) + earnedXp;
  updatePayload.weeklyXp = weeklyXp;

  // 3. TOPIC PROGRESS, STARS & MASTERY LOGIC
  if (topicId && challengeMode) {
    const existingProgress = currentData.topicProgress || {};
    const topicData = existingProgress[topicId] || { completedModes: [], stars: 0, masteryLevel: 'In Progress' };
    
    let completedModes = [...(topicData.completedModes || [])];
    const normalizedMode = challengeMode.toLowerCase().trim();

    // Add completed mode to list if not present
    if (!completedModes.includes(normalizedMode)) {
      completedModes.push(normalizedMode);
    }

    // Check if all 3 challenge modes (Quiz, Output Prediction, Bug-Fix) are completed
    const requiredModes = ['quiz', 'output prediction', 'bug-fix'];
    const isTopicFinished = requiredModes.every(mode => completedModes.includes(mode));

    // Calculate highest star rating (1 to 3 stars)
    const highestStars = Math.max(topicData.stars || 0, sessionStars);
    
    // Calculate completion percentage: 1 mode = 33%, 2 modes = 66%, 3 modes = 100%
    const masteryPercentage = Math.min(100, Math.round((completedModes.length / 3) * 100));

    // Prepare updated nested progress map for this topic
    const updatedTopicObject = {
      unlocked: true,
      completedModes: completedModes,
      stars: highestStars,
      masteryLevel: isTopicFinished ? 'Mastered' : 'In Progress',
      percentage: masteryPercentage
    };

    updatePayload[`topicProgress.${topicId}`] = updatedTopicObject;

    // 4. UNLOCK NEXT TOPIC IN SEQUENCE IF CURRENT TOPIC IS FULLY MASTERED
    if (isTopicFinished) {
      const topicSequence = ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'];
      const currentIndex = topicSequence.indexOf(topicId);
      
      if (currentIndex !== -1 && currentIndex + 1 < topicSequence.length) {
        const nextTopicId = topicSequence[currentIndex + 1];
        // Mark next topic as unlocked in Firestore
        updatePayload[`topicProgress.${nextTopicId}.unlocked`] = true;
      }
    }
  }

  // 5. AUTOMATIC TROPHY / BADGE UNLOCKING
  let trophies = [...(currentData.trophies || [])];
  if (newTotalQuests >= 1 && !trophies.includes('First steps')) {
    trophies.push('First steps');
  }
  updatePayload.trophies = trophies;

  // 6. FIRESTORE COMMIT
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      name: 'Adventurer',
      xp: 0,
      points: 0,
      completedQuests: 0,
      hearts: 5,
      streak: 1,
      trophies: trophies,
      topicProgress: { 
        topic_1: { unlocked: true, completedModes: [], stars: 0, percentage: 0 } 
      },
      weeklyXp: weeklyXp, // Initializes clean weekly tracking array
      lastHeartLossTime: null,
      ...updatePayload
    });
  } else {
    await updateDoc(userRef, updatePayload);
  }
}