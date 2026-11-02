// ==========================================
// USER SERVICE - STATS, TOPIC MASTERY & TROPHIES
// ==========================================
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export async function updateUserStats(stats, topicId = null) {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  // Prepare base update payload
  let updatePayload = { ...stats };

  // If a topicId was passed, update topic mastery progress safely
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
    // Initialize brand new user profile document with default values
    await setDoc(userRef, {
      name: 'Adventurer',
      xp: 0,
      points: 0,
      completedQuests: 0,
      hearts: 5,
      streak: 1,
      trophies: ['First Quest', 'Python Beginner'],
      topicProgress: {},
      ...updatePayload
    });
  } else {
    // Update existing user document in Firestore
    await updateDoc(userRef, updatePayload);
  }
}