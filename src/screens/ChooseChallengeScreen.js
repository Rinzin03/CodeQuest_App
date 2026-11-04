// ============================================================================
// CODEQUEST CHOOSE CHALLENGE SCREEN
// Allows users to select a challenge mode for the chosen topic and navigates to 
// QuizSessionScreen with the exact challengeMode tags expected by Firestore.
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ChooseChallengeScreen({ route, navigation }) {
  // Extract topicId and optional topicTitle from navigation parameters
  const { topicId, topicTitle } = route.params || { topicId: 'topic_1', topicTitle: 'Hello Python' };

  // ==========================================================================
  // CHALLENGE TYPES METADATA
  // The 'mode' field must match the 'challengeType' stored in Firestore:
  // - 'Quiz'
  // - 'Output Prediction'
  // - 'Bug-Fix'
  // ==========================================================================
  const challengeTypes = [
    { mode: 'Quiz', label: '🧠 Multiple Choice Quiz' },
    { mode: 'Output Prediction', label: '💻 Output Prediction' },
    { mode: 'Bug-Fix', label: '🛠️ Bug-Fix Challenge' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Challenge Type</Text>
      {topicTitle && <Text style={styles.subtitle}>{topicTitle}</Text>}

      {challengeTypes.map(item => (
        <TouchableOpacity
          key={item.mode}
          style={styles.card}
          onPress={() => 
            // Navigate to QuizSession passing exact parameter names: topicId and challengeMode
            navigation.navigate('QuizSession', { 
              topicId: topicId, 
              challengeMode: item.mode 
            })
          }
        >
          <Text style={styles.cardText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================================================
// STYLESHEET
// ============================================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, color: '#333' },
  subtitle: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#FF6B35' },
  card: { backgroundColor: '#FFD166', padding: 20, borderRadius: 15, marginVertical: 10, alignItems: 'center', borderWidth: 2, borderColor: '#1F1F1F' },
  cardText: { fontSize: 16, fontWeight: 'bold', color: '#1F1F1F' }
});