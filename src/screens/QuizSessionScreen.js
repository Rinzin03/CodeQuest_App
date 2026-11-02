// ============================================================================
// CODEQUEST QUIZ SESSION SCREEN - PRODUCTION & SYNCED VERSION
// Handles dynamic question fetching per challenge mode, option shuffling,
// real-time heart deduction, difficulty-weighted scoring, and Firestore updates.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc, increment } from 'firebase/firestore';
import { updateUserStats } from '../services/userService';
import DracoMascot from '../components/DracoMascot';

export default function QuizSessionScreen({ route, navigation }) {
  // Extract route parameters passed from navigation (defaults to topic_2 / Quiz mode)
  const { topicId, challengeMode, isDaily } = route.params || { 
    topicId: 'topic_2', 
    challengeMode: 'Quiz', 
    isDaily: false 
  };

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  const [questions, setQuestions] = useState([]);               // Questions loaded for this session
  const [currentIndex, setCurrentIndex] = useState(0);           // Current question index pointer
  const [shuffledOptions, setShuffledOptions] = useState([]);   // Shuffled option choices for current question
  const [selectedOption, setSelectedOption] = useState(null);   // Option selected by user
  const [isAnswerChecked, setIsAnswerChecked] = useState(false); // Controls feedback banner display
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false); // Result of user's selection
  
  const [hearts, setHearts] = useState(5);                       // Live heart count (synced with Firestore)
  const [score, setScore] = useState(0);                         // Number of correct answers in current session
  const [earnedPoints, setEarnedPoints] = useState(0);           // Cumulative difficulty-weighted points
  const [loading, setLoading] = useState(true);                  // Loading state while querying Firestore
  const [isFinished, setIsFinished] = useState(false);           // Session complete flag

  // Draco mascot reaction and hint speech bubble state
  const [dracoMood, setDracoMood] = useState('idle');
  const [dracoMessage, setDracoMessage] = useState("Read carefully and pick the correct option!");

  // ==========================================================================
  // UTILITY: FISHER-YATES SHUFFLE ALGORITHM
  // Ensures choices and question order are randomized and non-repeating.
  // ==========================================================================
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ==========================================================================
  // FIRESTORE DATA INITIALIZATION
  // Fetches current user hearts and queries sub-collection questions by mode.
  // ==========================================================================
  useEffect(() => {
    async function loadQuizData() {
      try {
        // 1. Fetch current authenticated user's heart count from Firestore
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists() && userDoc.data().hearts !== undefined) {
            setHearts(userDoc.data().hearts);
          }
        }

        // 2. Fetch all question documents under topics/{topicId}/questions
        const querySnapshot = await getDocs(collection(db, 'topics', topicId, 'questions'));
        let allQuestions = querySnapshot.docs.map(doc => doc.data());

        // 3. STRICT MODE FILTERING: Ensure Bug-Fix, Output Prediction, or Quiz get their exact matching questions
        let filtered = allQuestions.filter(
          q => q.challengeType?.toLowerCase().trim() === challengeMode?.toLowerCase().trim()
        );
        
        // Safety net fallback if specific mode filter yields zero items
        if (filtered.length === 0) {
          filtered = allQuestions;
        }

        // 4. Randomize question set and pick up to 5 unique items
        const randomized = shuffleArray(filtered).slice(0, Math.min(5, filtered.length));
        setQuestions(randomized);

        // 5. Shuffle options for the initial question
        if (randomized.length > 0) {
          setShuffledOptions(shuffleArray(randomized[0].options));
        }
      } catch (error) {
        console.error("Error loading questions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [topicId, challengeMode]);

  // ==========================================================================
  // ANSWER CHECKING & HEART DEDUCTION HANDLER
  // ==========================================================================
  const handleCheckAnswer = async () => {
    if (!selectedOption) {
      Alert.alert("Selection required", "Please select an answer!");
      return;
    }

    const currentQ = questions[currentIndex];
    const correct = selectedOption === currentQ.correctAnswer;
    setIsCorrectAnswer(correct);
    setIsAnswerChecked(true);

    const userId = auth.currentUser?.uid;

    if (correct) {
      // Correct answer: trigger happy Draco reaction and add points by difficulty level
      setDracoMood('success');
      setDracoMessage(currentQ.explanation);
      setScore(prev => prev + 1);

      // Points: easy = 10, medium = 20, hard = 30
      const diffPoints = currentQ.difficulty === 'hard' ? 30 : currentQ.difficulty === 'medium' ? 20 : 10;
      setEarnedPoints(prev => prev + diffPoints);
    } else {
      // Incorrect answer: trigger sad Draco reaction and deduct 1 heart live in Firestore
      setDracoMood('sad');
      setDracoMessage(`Incorrect. Correct answer: ${currentQ.correctAnswer}. ${currentQ.explanation}`);
      
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      
      if (userId) {
        await updateUserStats({ hearts: newHearts });
      }
    }
  };

  // ==========================================================================
  // NEXT QUESTION & QUEST COMPLETION HANDLER
  // Updates user XP, Points, Completed Quests, and Topic Progress on completion.
  // ==========================================================================
  const handleNextQuestion = async () => {
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setDracoMood('idle');
    setDracoMessage("Keep going!");

    if (currentIndex + 1 < questions.length) {
      // Advance to next question and shuffle its choices
      const nextQ = questions[currentIndex + 1];
      setShuffledOptions(shuffleArray(nextQ.options));
      setCurrentIndex(prev => prev + 1);
    } else {
      // End of quiz: display summary and sync total cumulative rewards to Firestore
      setIsFinished(true);
      const xpEarned = isDaily ? 40 : 20;
      
      const userId = auth.currentUser?.uid;
      if (userId) {
        // Sync stats, completed quests, and update topic mastery / trophy shelf
        await updateUserStats({
          xp: increment(xpEarned),
          points: increment(earnedPoints),
          completedQuests: increment(1),
        }, topicId);
      }
    }
  };

  // ==========================================================================
  // RENDER: LOADING STATE
  // ==========================================================================
  if (loading || questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // ==========================================================================
  // RENDER: QUEST COMPLETION SUMMARY CARD
  // Displays final score, dynamic star rating (1-3 stars), and earned rewards.
  // ==========================================================================
  if (isFinished) {
    const earnedXp = isDaily ? 40 : 20;
    const starsEarned = score >= 4 ? 3 : score >= 2 ? 2 : 1;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quest Complete! 🎉</Text>
          <Text style={styles.summaryScoreText}>Score: {score} / {questions.length}</Text>
          
          {/* Dynamic 3-Star Rating Row */}
          <View style={styles.starsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Ionicons 
                key={i} 
                name={i < starsEarned ? "star" : "star-outline"} 
                size={36} 
                color="#FFD166" 
                style={{ marginHorizontal: 4 }} 
              />
            ))}
          </View>

          {/* Reward Pill */}
          <View style={styles.xpRewardPill}>
            <Text style={styles.xpRewardText}>+{earnedXp} XP • +{earnedPoints} Points Earned</Text>
          </View>
        </View>

        <DracoMascot message="Fantastic job leveling up your coding skills!" mood="success" />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Return to Map →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Calculate current progress bar percentage
  const currentQ = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  // ==========================================================================
  // RENDER: ACTIVE QUESTION UI
  // ==========================================================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Top Header Row: Mode Badge, Question Counter & Live Hearts Display */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <FontAwesome5 name="code" size={18} color="#FFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{challengeMode}</Text>
          <Text style={styles.headerSubtitle}>QUESTION {currentIndex + 1} OF {questions.length}</Text>
        </View>
        
        {/* Live Heart Counter (1 to 5 Hearts) */}
        <View style={styles.heartsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons 
              key={i} 
              name={i < hearts ? "heart" : "heart-outline"} 
              size={18} 
              color="#E63946" 
              style={{ marginLeft: 2 }} 
            />
          ))}
        </View>
      </View>

      {/* Neubrutalist Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>

      {/* Main Question / Code Snippet Card */}
      <View style={styles.questionCard}>
        <Text style={styles.cardMainTitle}>{currentQ.title}</Text>
        
        {/* Render dark code terminal box if snippet is present */}
        {currentQ.codeSnippet && (
          <View style={styles.terminalBox}>
            <Text style={styles.terminalCode}>{currentQ.codeSnippet}</Text>
          </View>
        )}
        
        {currentQ.questionText && <Text style={styles.promptText}>{currentQ.questionText}</Text>}
      </View>

      {/* Shuffled Multiple Choice Options (A, B, C, D) */}
      {shuffledOptions.map((option, index) => {
        const letter = String.fromCharCode(65 + index); // Converts index 0..3 to A..D
        const isSelected = selectedOption === option;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
            onPress={() => !isAnswerChecked && setSelectedOption(option)}
          >
            <Text style={styles.optionLetter}>{letter}</Text>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {/* Draco Companion Mascot Component */}
      <DracoMascot message={dracoMessage} mood={dracoMood} />

      {/* Footer Action: Check Answer Button or Result Feedback Card */}
      {!isAnswerChecked ? (
        <TouchableOpacity style={styles.primaryButton} onPress={handleCheckAnswer}>
          <Text style={styles.primaryButtonText}>Check Answer →</Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.feedbackCard, isCorrectAnswer ? styles.correctFeedback : styles.wrongFeedback]}>
          <Text style={styles.feedbackTitle}>{isCorrectAnswer ? 'Correct! 🎉' : 'Incorrect ❌'}</Text>
          <Text style={styles.feedbackDesc}>{currentQ.explanation}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
            <Text style={styles.nextButtonText}>Next Question →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ============================================================================
// STYLESHEET (Neubrutalism Visual Theme)
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFD166' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD166' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  headerIconContainer: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F1F1F' },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#5C4033' },
  heartsRow: { flexDirection: 'row', marginLeft: 8 },
  progressBarTrack: { height: 10, backgroundColor: '#FFF', borderRadius: 5, borderWidth: 2, borderColor: '#1F1F1F', overflow: 'hidden', marginBottom: 16 },
  progressBarFill: { height: '100%', backgroundColor: '#FF6B35' },
  questionCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 14 },
  cardMainTitle: { fontSize: 18, fontWeight: '900', color: '#1F1F1F', marginBottom: 8 },
  promptText: { fontSize: 15, fontWeight: '900', color: '#1F1F1F', marginVertical: 8 },
  terminalBox: { backgroundColor: '#111', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: '#1F1F1F', marginBottom: 6 },
  terminalCode: { fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#FFD166', lineHeight: 20 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 12 },
  selectedOptionCard: { backgroundColor: '#FF8A5B' },
  optionLetter: { fontSize: 15, fontWeight: '900', color: '#1F1F1F', marginRight: 12, width: 20 },
  optionText: { fontSize: 15, fontFamily: 'monospace', fontWeight: '800', color: '#1F1F1F' },
  primaryButton: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 18, alignItems: 'center', borderWidth: 2.5, borderColor: '#1F1F1F', marginTop: 10 },
  primaryButtonText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  feedbackCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderWidth: 2.5, borderColor: '#1F1F1F', marginTop: 10 },
  correctFeedback: { backgroundColor: '#E8F5E9' },
  wrongFeedback: { backgroundColor: '#FFEBEE' },
  feedbackTitle: { fontSize: 16, fontWeight: '900', color: '#1F1F1F', marginBottom: 6 },
  feedbackDesc: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 12 },
  nextButton: { backgroundColor: '#FF6B35', padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderColor: '#1F1F1F' },
  nextButtonText: { fontSize: 14, fontWeight: '900', color: '#FFF' },
  summaryCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, borderWidth: 2.5, borderColor: '#1F1F1F', alignItems: 'center', marginBottom: 20 },
  summaryTitle: { fontSize: 24, fontWeight: '900', color: '#1F1F1F', marginBottom: 8 },
  summaryScoreText: { fontSize: 16, fontWeight: '800', color: '#555', marginBottom: 16 },
  starsRow: { flexDirection: 'row', marginBottom: 16 },
  xpRewardPill: { backgroundColor: '#FFD166', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 14, borderWidth: 2, borderColor: '#1F1F1F' },
  xpRewardText: { fontSize: 14, fontWeight: '900', color: '#1F1F1F' }
});