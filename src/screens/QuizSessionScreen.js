// ============================================================================
// CODEQUEST QUIZ SESSION SCREEN - MODE-SPECIFIC & NON-REPEATING
// Handles fetching mode-specific questions from Firestore, shuffling options,
// tracking live hearts, evaluating answers, and updating user profile progression.
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
  // Extract navigation parameters (topicId, challengeMode, and daily challenge flag)
  const { topicId, challengeMode, isDaily } = route.params || { 
    topicId: 'topic_1', 
    challengeMode: 'Quiz', 
    isDaily: false 
  };

  // ==========================================================================
  // COMPONENT STATE MANAGEMENT
  // ==========================================================================
  const [questions, setQuestions] = useState([]);               // Filtered and randomized questions for the session
  const [currentIndex, setCurrentIndex] = useState(0);           // Current question position tracker (0-4)
  const [shuffledOptions, setShuffledOptions] = useState([]);   // Randomized multiple-choice options for current question
  const [selectedOption, setSelectedOption] = useState(null);   // Option chosen by the user
  const [isAnswerChecked, setIsAnswerChecked] = useState(false); // Flag tracking if the answer has been submitted
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false); // Tracks if the user's answer was correct
  
  const [hearts, setHearts] = useState(5);                       // Active heart count synced with Firestore
  const [score, setScore] = useState(0);                         // Total correct answers in this session
  const [earnedPoints, setEarnedPoints] = useState(0);           // Cumulative difficulty-weighted points
  const [loading, setLoading] = useState(true);                  // Loading spinner indicator while fetching Firestore data
  const [isFinished, setIsFinished] = useState(false);           // Flag indicating completion of all questions

  // Draco mascot emotional state and speech bubble text
  const [dracoMood, setDracoMood] = useState('idle');
  const [dracoMessage, setDracoMessage] = useState("Read carefully and pick the correct option!");

  // ==========================================================================
  // FISHER-YATES SHUFFLE ALGORITHM
  // Randomizes arrays so choices and questions never appear in a fixed order.
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
  // DATA FETCHING & STRICT MODE FILTERING
  // Queries Firestore sub-collection and filters strictly by challengeMode.
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

        // 2. Fetch all questions inside the specific topic sub-collection
        const querySnapshot = await getDocs(collection(db, 'topics', topicId, 'questions'));
        let allQuestions = querySnapshot.docs.map(doc => doc.data());

        // 3. STRICT MODE FILTER: Normalize strings to compare challenge types exactly ('Quiz', 'Output Prediction', 'Bug-Fix')
        const targetMode = challengeMode ? challengeMode.toLowerCase().trim() : 'quiz';
        let filtered = allQuestions.filter(q => {
          const type = q.challengeType ? q.challengeType.toLowerCase().trim() : '';
          return type === targetMode;
        });

        // Fallback safety net if exact mode filter returns empty
        if (filtered.length === 0) {
          filtered = allQuestions;
        }

        // 4. Randomize and slice up to 5 unique questions to avoid repetition
        const randomized = shuffleArray(filtered).slice(0, Math.min(5, filtered.length));
        setQuestions(randomized);

        // 5. Shuffle option choices for the first question
        if (randomized.length > 0) {
          setShuffledOptions(shuffleArray(randomized[0].options));
        }
      } catch (error) {
        console.error("Error fetching mode questions:", error);
      } finally {
        setLoading(false); // Dismiss loading indicator
      }
    }
    loadQuizData();
  }, [topicId, challengeMode]);

  // ==========================================================================
  // ANSWER VERIFICATION & HEART DEDUCTION LOGIC
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
      // Correct answer: trigger happy Draco mood and increase score/points
      setDracoMood('success');
      setDracoMessage(currentQ.explanation);
      setScore(prev => prev + 1);

      // Award points based on question difficulty: easy = 10, medium = 20, hard = 30
      const diffPoints = currentQ.difficulty === 'hard' ? 30 : currentQ.difficulty === 'medium' ? 20 : 10;
      setEarnedPoints(prev => prev + diffPoints);
    } else {
      // Incorrect answer: trigger sad Draco mood and deduct 1 live heart
      setDracoMood('sad');
      setDracoMessage(`Incorrect. Correct answer: ${currentQ.correctAnswer}. ${currentQ.explanation}`);
      
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      
      // Update heart count immediately in Firestore
      if (userId) {
        await updateUserStats({ hearts: newHearts });
      }
    }
  };

  // ==========================================================================
  // PROGRESSION HANDLER: NEXT QUESTION OR QUEST SUMMARY
  // ==========================================================================
  const handleNextQuestion = async () => {
    // Reset question-level interactive states
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setDracoMood('idle');
    setDracoMessage("Keep going!");

    if (currentIndex + 1 < questions.length) {
      // Load next question in array and shuffle its answer choices
      const nextQ = questions[currentIndex + 1];
      setShuffledOptions(shuffleArray(nextQ.options));
      setCurrentIndex(prev => prev + 1);
    } else {
      // End of session: trigger summary view and sync cumulative rewards to Firestore
      setIsFinished(true);
      const xpEarned = isDaily ? 40 : 20; // Daily challenges yield double XP
      
      const userId = auth.currentUser?.uid;
      if (userId) {
        // Atomically increment XP, points, completed quests, and update topic mastery / trophy shelf
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
  // RENDER: QUEST COMPLETE SUMMARY SCREEN
  // ==========================================================================
  if (isFinished) {
    const earnedXp = isDaily ? 40 : 20;
    const starsEarned = score >= 4 ? 3 : score >= 2 ? 2 : 1; // Calculate star rating based on correct answers

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quest Complete! 🎉</Text>
          <Text style={styles.summaryScoreText}>Score: {score} / {questions.length}</Text>
          
          {/* Dynamic 3-Star Rating Display */}
          <div /> {/* Semantic spacer wrapper */}
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

          {/* XP & Points Reward Pill */}
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

  // Active question references and progress calculation
  const currentQ = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  // ==========================================================================
  // RENDER: ACTIVE QUESTION INTERFACE
  // ==========================================================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Top Header Row: Challenge Mode Title, Counter & Live Hearts Status */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <FontAwesome5 name="code" size={18} color="#FFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{challengeMode}</Text>
          <Text style={styles.headerSubtitle}>QUESTION {currentIndex + 1} OF {questions.length}</Text>
        </View>
        
        {/* Live Heart Counter Display (1 to 5 Hearts) */}
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

      {/* Neubrutalist Progress Bar Track */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>

      {/* Main Question / Code Terminal Card */}
      <View style={styles.questionCard}>
        <Text style={styles.cardMainTitle}>{currentQ.title}</Text>
        
        {/* Renders code snippet block if available (used for Output Prediction & Bug-Fix) */}
        {currentQ.codeSnippet && (
          <View style={styles.terminalBox}>
            <Text style={styles.terminalCode}>{currentQ.codeSnippet}</Text>
          </View>
        )}
        
        {currentQ.questionText && <Text style={styles.promptText}>{currentQ.questionText}</Text>}
      </View>

      {/* Shuffled Multiple-Choice Option Buttons (A, B, C, D) */}
      {shuffledOptions.map((option, index) => {
        const letter = String.fromCharCode(65 + index); // Converts index 0..3 to letters A..D
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

      {/* Interactive Draco Companion Mascot */}
      <DracoMascot message={dracoMessage} mood={dracoMood} />

      {/* Action Footer: Check Answer Button or Result Feedback Banner */}
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
// STYLESHEET (Neubrutalism Design Theme)
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