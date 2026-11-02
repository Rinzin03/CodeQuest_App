import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { shuffleArray } from '../utils/shuffle';

export async function fetchRandomQuestQuestions(topicId, challengeType) {
  try {
    // Query Firestore for documents matching the chosen topic and challenge type
    const q = query(
      collection(db, 'questions'),
      where('topicId', '==', topicId),
      where('type', '==', challengeType)
    );
    
    const querySnapshot = await getDocs(q);
    const allQuestions = querySnapshot.docs.map(doc => doc.data());

    // Randomize order of questions, pick the first 5, and shuffle multiple-choice options
    const randomizedQuestions = shuffleArray(allQuestions).slice(0, 5).map(question => ({
      ...question,
      options: shuffleArray(question.options)
    }));

    return randomizedQuestions;
  } catch (error) {
    console.error("Error fetching randomized questions: ", error);
    return [];
  }
}