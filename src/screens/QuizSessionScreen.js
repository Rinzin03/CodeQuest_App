// ============================================================================
// CODEQUEST QUIZ SESSION SCREEN
// Dynamic renderer for Quiz, Output Prediction, Bug-Fix, and Daily Challenges.
// Handles question shuffling, difficulty scoring, hearts, and Firestore updates.
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { updateUserStats } from '../services/userService';
import DracoMascot from '../components/DracoMascot';

export default function QuizSessionScreen({ route, navigation }) {
  // Extract route parameters with fallback defaults (topic ID, challenge mode, daily flag)
  const { topicId, challengeMode, isDaily } = route.params || { topicId: 'topic_2', challengeMode: 'Quiz', isDaily: false };

  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [questions, setQuestions] = useState([]);               // Active pool of 5 randomized questions
  const [currentIndex, setCurrentIndex] = useState(0);           // Index of current question (0-4)
  const [shuffledOptions, setShuffledOptions] = useState([]);   // Shuffled options for current question
  const [selectedOption, setSelectedOption] = useState(null);   // Option selected by user
  const [isAnswerChecked, setIsAnswerChecked] = useState(false); // Flag tracking if answer was checked
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false); // Flag tracking if checked answer is correct
  
  const [hearts, setHearts] = useState(5);                       // User's current heart count
  const [score, setScore] = useState(0);                         // Correct answer count for current quest
  const [earnedPoints, setEarnedPoints] = useState(0);           // Total difficulty-weighted points earned
  const [loading, setLoading] = useState(true);                  // Loading state for initial Firestore query
  const [isFinished, setIsFinished] = useState(false);           // Flag signaling quest completion summary UI

  // Draco mascot emotional state & active speech text
  const [dracoMood, setDracoMood] = useState('idle');
  const [dracoMessage, setDracoMessage] = useState("Read carefully and pick the correct option!");

  // --------------------------------------------------------------------------
  // ALGORITHM: FISHER-YATES SHUFFLE
  // Randomizes arrays without duplicate items or repeating positional bias
  // --------------------------------------------------------------------------
  const shuffleArray = (array) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // --------------------------------------------------------------------------
  // FIRESTORE DATA FETCHING EFFECT
  // Retrieves live user hearts and queries matching questions from Firestore
  // --------------------------------------------------------------------------
  useEffect(() => {
    async function loadQuizData() {
      try {
        // 1. Fetch live user heart count from Firestore
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists() && userDoc.data().hearts !== undefined) {
            setHearts(userDoc.data().hearts);
          }
        }

        // 2. Fetch all questions under the current topic's Firestore sub-collection
        const querySnapshot = await getDocs(collection(db, 'topics', topicId, 'questions'));
        let allQuestions = querySnapshot.docs.map(doc => doc.data());

        // 3. Filter questions matching the requested challenge type (Quiz, Output Prediction, Bug-Fix)
        let filtered = allQuestions.filter(q => q.challengeType === challengeMode);
        if (filtered.length === 0) filtered = allQuestions; // Fallback to all questions if none match type

        // 4. Select exactly 5 unique questions randomly to prevent repeated questions
        const randomized = shuffleArray(filtered).slice(0, 5);
        setQuestions(randomized);

        // 5. Shuffle options for the initial question (Question 1)
        if (randomized.length > 0) {
          setShuffledOptions(shuffleArray(randomized[0].options));
        }
      } catch (error) {
        console.error("Error loading questions from Firestore:", error);
      } finally {
        setLoading(false); // Hide loading indicator once setup finishes
      }
    }
    loadQuizData();
  }, [topicId, challengeMode]);

  // --------------------------------------------------------------------------
  // HANDLER: ANSWER VERIFICATION & POINT CALCULATION
  // --------------------------------------------------------------------------
  const handleCheckAnswer = async () => {
    // Validate selection before evaluation
    if (!selectedOption) {
      Alert.alert("Selection required", "Please select an answer!");
      return;
    }

    const currentQ = questions[currentIndex];
    const correct = selectedOption === currentQ.correctAnswer;
    setIsCorrectAnswer(correct);
    setIsAnswerChecked(true);

    if (correct) {
      // Trigger happy mascot expression and display explanation text
      setDracoMood('success');
      setDracoMessage(currentQ.explanation);
      setScore(prev => prev + 1);

      // Award points dynamically based on difficulty tier: easy=10, medium=20, hard=30
      const diffPoints = currentQ.difficulty === 'hard' ? 30 : currentQ.difficulty === 'medium' ? 20 : 10;
      setEarnedPoints(prev => prev + diffPoints);
    } else {
      // Trigger sad mascot expression and display feedback explanation
      setDracoMood('sad');
      setDracoMessage(`Incorrect. Correct answer: ${currentQ.correctAnswer}. ${currentQ.explanation}`);
      
      // Deduct 1 heart and update Firestore immediately using atomic helper
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      await updateUserStats({ hearts: newHearts });
    }
  };

  // --------------------------------------------------------------------------
  // HANDLER: NEXT QUESTION & QUEST COMPLETION
  // --------------------------------------------------------------------------
  const handleNextQuestion = async () => {
    // Reset question-level interface state
    setIsAnswerChecked(false);
    setSelectedOption(null);
    setDracoMood('idle');
    setDracoMessage("Keep going!");

    if (currentIndex + 1 < questions.length) {
      // Advance to next question and shuffle its options
      const nextQ = questions[currentIndex + 1];
      setShuffledOptions(shuffleArray(nextQ.options));
      setCurrentIndex(prev => prev + 1);
    } else {
      // Quest complete: trigger summary view and update user Firestore stats
      setIsFinished(true);
      const xpEarned = isDaily ? 40 : 20; // Double XP for daily challenges
      
      // Persist XP, points, and quest progress atomically into Firestore
      await updateUserStats({
        xp: increment(xpEarned),
        points: increment(earnedPoints),
        completedQuests: increment(1),
      });
    }
  };

  // --------------------------------------------------------------------------
  // RENDER: LOADING STATE
  // --------------------------------------------------------------------------
  if (loading || questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: QUEST SUMMARY SCREEN (End of 5 Questions)
  // Displays score, star rating, XP earned, and points breakdown
  // --------------------------------------------------------------------------
  if (isFinished) {
    const earnedXp = isDaily ? 40 : 20;
    const starsEarned = score >= 4 ? 3 : score >= 2 ? 2 : 1; // Compute star rating based on score

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quest Complete! 🎉</Text>
          <Text style={styles.summaryScoreText}>Score: {score} / {questions.length}</Text>
          
          {/* Render earned star icons */}
          <View style={styles.starsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Ionicons key={i} name={i < starsEarned ? "star" : "star-outline"} size={36} color="#FFD166" style={{ marginHorizontal: 4 }} />
            ))}
          </View>

          {/* Display earned XP and difficulty-calculated points */}
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

  // --------------------------------------------------------------------------
  // RENDER: ACTIVE QUESTION UI
  // Renders header, progress bar, terminal code box, shuffled options, and Draco
  // --------------------------------------------------------------------------
  const currentQ = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header section displaying challenge type and question counter */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <FontAwesome5 name="code" size={18} color="#FFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{challengeMode}</Text>
          <Text style={styles.headerSubtitle}>QUESTION {currentIndex + 1} OF {questions.length}</Text>
        </View>
      </View>

      {/* Dynamic progress bar tracking quest completion */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
      </View>

      {/* Main question card containing title, optional code snippet, and prompt */}
      <View style={styles.questionCard}>
        <Text style={styles.cardMainTitle}>{currentQ.title}</Text>
        {currentQ.codeSnippet && (
          <View style={styles.terminalBox}>
            <Text style={styles.terminalCode}>{currentQ.codeSnippet}</Text>
          </View>
        )}
        {currentQ.questionText && <Text style={styles.promptText}>{currentQ.questionText}</Text>}
      </View>

      {/* Render shuffled multiple-choice options with letter prefixes (A, B, C, D) */}
      {shuffledOptions.map((option, index) => {
        const letter = String.fromCharCode(65 + index); // Convert index 0..3 to letters A..D
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

      {/* Draco Mascot providing hints and mood feedback */}
      <DracoMascot message={dracoMessage} mood={dracoMood} />

      {/* Action Footer: Shows "Check Answer" initially, switches to feedback card when checked */}
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

// ----------------------------------------------------------------------------
// STYLESHEET (Neubrutalism UI Theme)
// ----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFD166' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD166' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  headerIconContainer: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1F1F1F' },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#5C4033' },
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