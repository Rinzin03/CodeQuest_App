// ==========================================
// IMPORTING REACT, COMPONENTS & FIREBASE
// ==========================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Import our new big freestanding Draco mascot component
import DracoMascot from '../components/DracoMascot';

export default function QuestMapScreen({ navigation }) {
  // --- STATE HOOKS ---
  const defaultTopics = [
    { id: 'topic_1', title: 'Hello Python', description: 'Complete • print() & strings', order: 1 },
    { id: 'topic_2', title: 'Variables', description: 'Up next • names & values', order: 2 },
    { id: 'topic_3', title: 'Conditionals', description: 'Finish Variables to unlock', order: 3 },
    { id: 'topic_4', title: 'Loops', description: 'Finish Conditionals to unlock', order: 4 },
    { id: 'topic_5', title: 'Functions', description: 'Finish Loops to unlock', order: 5 },
  ];

  const [topics, setTopics] = useState(defaultTopics);
  const [userProgress, setUserProgress] = useState({});
  const [dracoMood, setDracoMood] = useState('idle');

  // Draco quote rotation
  const dracoQuotes = [
    "One topic at a time! Finish each quest to unlock your next adventure.",
    "Look at me float! Let's code some Python today!",
    "Chubby dragon power! Tap any unlocked quest to start!",
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Trigger double hop when Draco is tapped!
  const handleDracoTap = () => {
    setDracoMood('success');
    setQuoteIndex((prevIndex) => (prevIndex + 1) % dracoQuotes.length);
    setTimeout(() => setDracoMood('idle'), 1000);
  };

  // Trigger head shake when a locked topic is tapped!
  const handleLockedTopicPress = (topicTitle) => {
    setDracoMood('warning');
    setTimeout(() => setDracoMood('idle'), 1000);
  };

  // Fetch Firestore data safely
  useEffect(() => {
    async function loadMapData() {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setUserProgress(userDoc.data().topicProgress || {});
          }
        }

        const topicSnapshot = await getDocs(collection(db, 'topics'));
        if (!topicSnapshot.empty) {
          const topicsList = topicSnapshot.docs.map(doc => doc.data());
          topicsList.sort((a, b) => a.order - b.order);
          setTopics(topicsList);
        }
      } catch (error) {
        console.log("Using default fallback topics:", error.message);
      }
    }
    loadMapData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <FontAwesome5 name="code" size={18} color="#FFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Your quest map</Text>
          <Text style={styles.headerSubtitle}>PYTHON BASICS • CHAPTER 1</Text>
        </View>
        <TouchableOpacity style={styles.sparkleButton}>
          <MaterialCommunityIcons name="star-four-points" size={18} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      {/* ========================================== */}
      {/* FREESTANDING BIG DRACO MASCOT              */}
      {/* ========================================== */}
      <DracoMascot 
        message={dracoQuotes[quoteIndex]} 
        mood={dracoMood} 
        onTap={handleDracoTap} 
      />

      {/* Zigzag Quest Nodes */}
      {topics.map((topic, index) => {
        const prevTopicId = index > 0 ? topics[index - 1].id : null;
        const isCompleted = userProgress[topic.id]?.completed || false;
        const isUnlocked = index === 0 || (prevTopicId && userProgress[prevTopicId]?.completed);
        const isActive = isUnlocked && !isCompleted;
        const stars = userProgress[topic.id]?.stars || 0;

        let cardStyle = styles.whiteNodeCard;
        let iconComponent = <Ionicons name="lock-closed" size={20} color="#D4A373" />;
        let statusText = topic.description;

        if (isCompleted) {
          cardStyle = styles.whiteNodeCard;
          iconComponent = <Ionicons name="checkmark" size={20} color="#2D6A4F" />;
          statusText = 'Complete • Finished';
        } else if (isActive) {
          cardStyle = styles.activeNodeCard;
          iconComponent = <Ionicons name="play" size={18} color="#1F1F1F" />;
          statusText = 'Up next • Tap to start';
        } else {
          cardStyle = styles.lockedNodeCard;
          iconComponent = <Ionicons name="lock-closed" size={20} color="#888" />;
          statusText = `Finish ${topics[index - 1]?.title} to unlock`;
        }

        const isEven = index % 2 === 0;

        return (
          <React.Fragment key={topic.id}>
            <View style={[styles.nodeWrapper, isEven ? styles.alignRight : styles.alignLeft]}>
              <TouchableOpacity
                style={[styles.nodeCard, cardStyle]}
                onPress={() => {
                  if (isUnlocked) {
                    navigation.navigate('ChooseChallenge', { topicId: topic.id });
                  } else {
                    handleLockedTopicPress(topic.title);
                  }
                }}
              >
                <View style={[styles.iconCircle, isActive && styles.activeIconCircle]}>
                  {iconComponent}
                </View>
                <View style={styles.nodeTextContainer}>
                  <Text style={[styles.nodeTitle, isActive && styles.activeNodeTitle]}>
                    {topic.title}
                  </Text>
                  <Text style={[styles.nodeSubtext, isActive && styles.activeNodeSubtext]} numberOfLines={1}>
                    {statusText}
                  </Text>
                  
                  <View style={styles.starsRow}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Text key={i} style={styles.starIcon}>
                        {i < stars ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {index < topics.length - 1 && (
              <View style={styles.dashedPathContainer}>
                <View style={styles.dashedLine} />
              </View>
            )}
          </React.Fragment>
        );
      })}

      <Text style={styles.footerNote}>★ Earn up to 3 stars per topic · Locked topics follow in order</Text>
    </ScrollView>
  );
}

// ==========================================
// STYLING SHEET
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFD166' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  headerIconContainer: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F1F1F', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#5C4033', marginTop: 1 },
  sparkleButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F' },

  nodeWrapper: { width: '88%' },
  alignLeft: { alignSelf: 'flex-start' },
  alignRight: { alignSelf: 'flex-end' },

  nodeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, borderWidth: 2.5, borderColor: '#1F1F1F', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  whiteNodeCard: { backgroundColor: '#FFF' },
  activeNodeCard: { backgroundColor: '#FF6B35' },
  lockedNodeCard: { backgroundColor: '#F0E6D2', opacity: 0.85 },

  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1F1F1F', marginRight: 12 },
  activeIconCircle: { backgroundColor: '#FFF' },

  nodeTextContainer: { flex: 1 },
  nodeTitle: { fontSize: 16, fontWeight: '900', color: '#1F1F1F', marginBottom: 1 },
  activeNodeTitle: { color: '#FFF' },
  nodeSubtext: { fontSize: 11, fontWeight: '700', color: '#555', marginBottom: 4 },
  activeNodeSubtext: { color: '#FFE3D8' },
  
  starsRow: { flexDirection: 'row' },
  starIcon: { fontSize: 13, color: '#FFB703', marginRight: 2, fontWeight: 'bold' },

  dashedPathContainer: { height: 25, justifyContent: 'center', alignItems: 'center' },
  dashedLine: { width: 3, height: '100%', borderStyle: 'dotted', borderWidth: 2, borderColor: '#1F1F1F', opacity: 0.5 },

  footerNote: { textAlign: 'center', fontSize: 10, fontWeight: '800', color: '#5C4033', marginTop: 15 }
});