import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ChooseChallengeScreen({ route, navigation }) {
  const { topicId } = route.params;

  const challengeTypes = [
    { type: 'quiz', label: '🧠 Multiple Choice Quiz' },
    { type: 'output', label: '💻 Output Prediction' },
    { type: 'bugfix', label: '🛠️ Bug-Fix Challenge' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Challenge Type</Text>
      {challengeTypes.map(item => (
        <TouchableOpacity
          key={item.type}
          style={styles.card}
          onPress={() => navigation.navigate('QuizSession', { topicId, challengeType: item.type })}
        >
          <Text style={styles.cardText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6', padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  card: { backgroundColor: '#FFD166', padding: 20, borderRadius: 15, marginVertical: 10, alignItems: 'center' },
  cardText: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});