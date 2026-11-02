// ==========================================
// UNIFIED DYNAMIC CHALLENGE SESSION SCREEN
// ==========================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import DracoMascot from '../components/DracoMascot';

export default function ChallengeSessionScreen({ route, navigation }) {
  const { topicId, challengeMode } = route.params || { topicId: 'topic_2', challengeMode: 'Quiz' };

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hearts, setHearts] = useState(5);
  const [loading, setLoading] = useState(true);
  const [dracoMood, setDracoMood] = useState('idle');
  const [dracoMessage, setDracoMessage] = useState("Let's solve this challenge together! 🐲");

  // --- FETCH QUESTIONS DYNAMICALLY FROM FIRESTORE ---
  useEffect(() => {
    async function fetchChallengeQuestions() {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists() && userDoc.data().hearts !== undefined) {
            setHearts(userDoc.data().hearts);
          }
        }

        const querySnapshot = await getDocs(collection(db, 'topics', topicId, 'questions'));
        let allQuestions = querySnapshot.docs.map(doc => doc.data());
        
        // Filter questions matching the selected challenge mode
        let filtered = allQuestions.filter(q => q.challengeType === challengeMode);

        // Fallback mock questions if database is empty for this mode
        if (filtered.length === 0) {
          if (challengeMode === 'Bug-Fix') {
            filtered = [{
              id: 'b1', challengeType: 'Bug-Fix',
              title: 'Make the message print.',
              subtitle: 'This code raises a NameError. Which line 2 replacement fixes it?',
              codeSnippet: '1  name = "Maya"\n2  print(Name)',
              errorText: "NameError: name 'Name' is not defined",
              options: ['print(name)', 'print("Name")', 'print(NAME)'],
              correctAnswer: 'print(name)',
              explanation: 'Python is case-sensitive. name and Name are different names!'
            }];
          } else if (challengeMode === 'Output Prediction') {
            filtered = [{
              id: 'p1', challengeType: 'Output Prediction',
              title: 'Predict the output.',
              subtitle: 'Read the code snippet below and choose what it prints.',
              codeSnippet: 'x = 5\ny = 2\nprint(x * y)',
              options: ['10', '7', '52', 'Error'],
              correctAnswer: '10',
              explanation: 'Multiplying 5 by 2 yields 10.'
            }];
          } else {
            filtered = [{
              id: 'q1', challengeType: 'Quiz',
              title: 'Test your knowledge.',
              subtitle: 'Which function is used to output text in Python?',
              options: ['print()', 'echo()', 'write()', 'display()'],
              correctAnswer: 'print()',
              explanation: 'print() is the standard built-in output function in Python.'
            }];
          }
        }

        setQuestions(filtered);
      } catch (error) {
        console.error("Error fetching challenge questions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChallengeQuestions();
  }, [topicId, challengeMode]);

  // --- CHECK ANSWER ---
  const handleSubmitAnswer = async () => {
    if (!selectedOption) {
      Alert.alert("Selection required", "Please choose an option before continuing!");
      return;
    }

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    const userId = auth.currentUser?.uid;

    if (isCorrect) {
      setDracoMood('success');
      setDracoMessage("Correct! Amazing job! 🎉");
    } else {
      setDracoMood('sad');
      setDracoMessage(currentQ.explanation || "Incorrect! Keep trying.");
      
      const newHearts = Math.max(0, hearts - 1);
      setHearts(newHearts);
      if (userId) {
        await updateDoc(doc(db, 'users', userId), { hearts: newHearts });
      }
    }

    setTimeout(() => {
      setSelectedOption(null);
      setDracoMood('idle');
      setDracoMessage("You've got this! Read closely.");

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        Alert.alert(
          "Quest Complete! 🎉",
          `You completed the ${challengeMode} challenge successfully!`,
          [{ text: "Return to Map", onPress: () => navigation.goBack() }]
        );
      }
    }, 2000);
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <FontAwesome5 name="code" size={18} color="#FFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{challengeMode === 'Bug-Fix' ? 'Squash that bug' : challengeMode}</Text>
          <Text style={styles.headerSubtitle}>VARIABLES • {currentIndex + 1}/{questions.length}</Text>
        </View>
        <TouchableOpacity style={styles.sparkleButton}>
          <MaterialCommunityIcons name="star-four-points" size={18} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      {/* Subheader (XP & Hearts) */}
      <View style={styles.subHeader}>
        <Text style={styles.xpText}>{challengeMode.toUpperCase()} • +20 XP</Text>
        <View style={styles.heartsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons 
              key={i} 
              name={i < hearts ? "heart" : "heart-outline"} 
              size={20} 
              color="#E63946" 
              style={{ marginLeft: 3 }}
            />
          ))}
        </View>
      </View>

      {/* Question / Terminal Card */}
      <View style={styles.questionCard}>
        <Text style={styles.cardMainTitle}>{currentQ.title}</Text>
        <Text style={styles.cardSubtitle}>{currentQ.subtitle}</Text>

        {/* Display Terminal Box if codeSnippet exists (for Bug-Fix or Output Prediction) */}
        {currentQ.codeSnippet && (
          <View style={styles.terminalBox}>
            <Text style={styles.terminalHeader}>PYTHON</Text>
            <Text style={styles.terminalCode}>{currentQ.codeSnippet}</Text>
          </View>
        )}

        {currentQ.errorText && (
          <Text style={styles.errorTraceText}>{currentQ.errorText}</Text>
        )}

        {!currentQ.codeSnippet && (
          <Text style={styles.questionPromptText}>{currentQ.questionText}</Text>
        )}
      </View>

      {/* Options Selection (A, B, C...) */}
      {currentQ.options.map((option, index) => {
        const letter = String.fromCharCode(65 + index);
        const isSelected = selectedOption === option;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
            onPress={() => setSelectedOption(option)}
          >
            <Text style={styles.optionLetter}>{letter}</Text>
            <Text style={styles.optionText}>{option}</Text>
            {isSelected && <Ionicons name="checkmark" size={20} color="#1F1F1F" style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        );
      })}

      {/* Expressive Draco Mascot */}
      <DracoMascot message={dracoMessage} mood={dracoMood} />

      {/* Action Button */}
      <TouchableOpacity style={styles.checkButton} onPress={handleSubmitAnswer}>
        <Text style={styles.checkButtonText}>
          {challengeMode === 'Bug-Fix' ? 'Check Fix →' : 'Submit Answer →'}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFD166' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD166' },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
  headerIconContainer: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F1F1F' },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#5C4033', marginTop: 1 },
  sparkleButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F' },

  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  xpText: { fontSize: 11, fontWeight: '900', color: '#5C4033' },
  heartsRow: { flexDirection: 'row' },

  questionCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  cardMainTitle: { fontSize: 18, fontWeight: '900', color: '#1F1F1F', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 14, lineHeight: 16 },
  questionPromptText: { fontSize: 15, fontWeight: '900', color: '#1F1F1F', marginVertical: 10 },

  terminalBox: { backgroundColor: '#111', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: '#1F1F1F', marginBottom: 10 },
  terminalHeader: { fontSize: 9, fontWeight: '900', color: '#888', marginBottom: 6, letterSpacing: 1 },
  terminalCode: { fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#FFD166', lineHeight: 20 },
  errorTraceText: { fontSize: 11, fontWeight: '800', color: '#E63946', marginTop: 4 },

  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 18, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  selectedOptionCard: { backgroundColor: '#FF8A5B', borderColor: '#1F1F1F' },
  optionLetter: { fontSize: 15, fontWeight: '900', color: '#1F1F1F', marginRight: 12, width: 20 },
  optionText: { fontSize: 15, fontFamily: 'monospace', fontWeight: '800', color: '#1F1F1F' },

  checkButton: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 18, alignItems: 'center', borderWidth: 2.5, borderColor: '#1F1F1F', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  checkButtonText: { fontSize: 16, fontWeight: '900', color: '#FFF' }
});