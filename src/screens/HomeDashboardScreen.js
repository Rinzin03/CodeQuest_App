// ==========================================
// CODEQUEST HOME DASHBOARD & HEART RECHARGE SCREEN
// ==========================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Import your reusable Draco Mascot component
import DracoMascot from '../components/DracoMascot';

export default function HomeScreen({ navigation }) {
  // --- STATE HOOKS ---
  const [loading, setLoading] = useState(true);
  const [dracoMood, setDracoMood] = useState('idle');
  
  // Fresh start user initial stats
  const [userData, setUserData] = useState({
    name: 'Adventurer',
    level: 1,
    levelTitle: 'Egg',
    xp: 0,
    nextLevelXp: 100,
    points: 0,
    questsDone: 0,
    streak: 0,
    hearts: 5,
    weeklyXp: [0, 0, 0, 0, 0, 0, 0], // M, T, W, T, F, S, S graph bars
  });

  // 25-minute heart recharge countdown timer state (in seconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  // --- FETCH LIVE USER DATA FROM FIREBASE FIRESTORE ---
  useEffect(() => {
    async function fetchUserHomeData() {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const currentXp = data.xp || 0;
            const calculatedLevel = Math.floor(currentXp / 100) + 1;
            const levelTitle = calculatedLevel >= 5 ? 'Wingling' : calculatedLevel >= 3 ? 'Hatchling' : 'Egg';

            setUserData({
              name: data.name || 'Adventurer',
              level: calculatedLevel,
              levelTitle: levelTitle,
              xp: currentXp,
              nextLevelXp: calculatedLevel * 100,
              points: data.points || currentXp,
              questsDone: data.completedQuests || 0,
              streak: data.streak || 0,
              hearts: data.hearts !== undefined ? data.hearts : 5,
              weeklyXp: data.weeklyXp || [0, 0, 0, 0, 0, 0, 0],
            });
          }
        }
      } catch (error) {
        console.log("Error fetching home stats from Firebase:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserHomeData();
  }, []);

  // --- 25-MINUTE HEART RECHARGE COUNTDOWN TIMER LOGIC ---
  useEffect(() => {
    let timer = null;
    if (userData.hearts === 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 25 * 60; // Reset timer upon completion
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [userData.hearts]);

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle Draco Tap Interaction
  const handleDracoTap = () => {
    setDracoMood('success');
    setTimeout(() => setDracoMood('idle'), 1200);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // ==========================================
  // VIEW 1: OUT OF HEARTS SCREEN (25-Min Timer)[cite: 8]
  // ==========================================
  if (userData.hearts === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* Out of Hearts Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <FontAwesome5 name="code" size={18} color="#FFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Time for a breather</Text>
            <Text style={styles.headerSubtitle}>YOUR PROGRESS IS SAFE</Text>
          </View>
          <TouchableOpacity style={styles.sparkleButton}>
            <MaterialCommunityIcons name="star-four-points" size={18} color="#1F1F1F" />
          </TouchableOpacity>
        </View>

        {/* Empty Hearts Row */}
        <View style={styles.heartsRowCenter}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons key={i} name="heart-outline" size={26} color="#1F1F1F" style={{ marginHorizontal: 4 }} />
          ))}
        </View>

        <Text style={styles.outOfHeartsHeading}>Out of hearts</Text>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Ionicons name="time-outline" size={22} color="#1F1F1F" style={{ marginBottom: 4 }} />
          <Text style={styles.timerLabel}>NEXT HEART IN</Text>
          <Text style={styles.timerCountdown}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerSubtext}>Take a break. Your next quest will be here.</Text>
        </View>

        {/* Crying Draco Mascot */}
        <DracoMascot 
          message="Mistakes help you learn. Review names and values while we recharge." 
          mood="sad" 
          onTap={handleDracoTap} 
        />

        {/* Review Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('QuestMap')}
        >
          <Text style={styles.primaryButtonText}>Review Python Basics →</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setUserData(prev => ({ ...prev, hearts: 5 }))}>
          <Text style={styles.footerBackNote}>Review without using hearts · Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    );
  }

  // ==========================================
  // VIEW 2: NORMAL HOME DASHBOARD (Fresh Start)[cite: 7]
  // ==========================================
  const levelPercentage = Math.min(100, Math.round((userData.xp / userData.nextLevelXp) * 100));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Top Greeting Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconContainer}>
          <FontAwesome5 name="code" size={18} color="#FFF" />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Hey, {userData.name}!</Text>
          <Text style={styles.headerSubtitle}>LET'S MAKE A LITTLE PROGRESS</Text>
        </View>
        <TouchableOpacity style={styles.sparkleButton}>
          <MaterialCommunityIcons name="star-four-points" size={18} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      {/* Hearts and Streak Row */}
      <View style={styles.statusBarRow}>
        <View style={styles.heartsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons 
              key={i} 
              name={i < userData.hearts ? "heart" : "heart-outline"} 
              size={22} 
              color="#E63946" 
              style={{ marginRight: 2 }}
            />
          ))}
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#FF6B35" style={{ marginRight: 4 }} />
          <Text style={styles.streakText}>{userData.streak}-day streak</Text>
        </View>
      </View>

      {/* Level & XP Progress Card */}
      <View style={styles.card}>
        <View style={styles.levelCardTop}>
          <Text style={styles.levelTitle}>Level {userData.level} • {userData.levelTitle}</Text>
          <View style={styles.eggBadge}>
            <Text style={{ fontSize: 12 }}>🥚</Text>
          </View>
        </View>
        <Text style={styles.xpText}>{userData.xp} / {userData.nextLevelXp} XP</Text>
        
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${levelPercentage}%` }]} />
        </View>
        
        <Text style={styles.levelFooterText}>
          {userData.nextLevelXp - userData.xp} XP until Level {userData.level + 1} • {userData.xp} total XP
        </Text>
      </View>

      {/* Stats Grid (Quest Points & Quests Done) */}
      <View style={styles.statsGridRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData.points}</Text>
          <Text style={styles.statLabel}>Quest points</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData.questsDone}</Text>
          <Text style={styles.statLabel}>Quests done</Text>
        </View>
      </View>

      {/* Weekly XP Graph Card */}
      <View style={styles.card}>
        <View style={styles.graphHeaderRow}>
          <Text style={styles.graphTitle}>Your week in XP</Text>
          <Text style={styles.graphTotalXp}>
            {userData.weeklyXp.reduce((a, b) => a + b, 0)} XP
          </Text>
        </View>

        <View style={styles.barChartContainer}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
            const barHeight = Math.max(12, Math.min(70, userData.weeklyXp[index] || 8));
            const isToday = index === 6; // Highlight today

            return (
              <View key={index} style={styles.barColumn}>
                <View 
                  style={[
                    styles.barPillar, 
                    { height: barHeight },
                    isToday && styles.activeBarPillar
                  ]} 
                />
                <Text style={styles.barDayLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Draco Mascot Guidance Banner */}
      <DracoMascot 
        message="A variable is a name for a value. Let's give your code a memory!" 
        mood={dracoMood} 
        onTap={handleDracoTap} 
      />

      {/* Continue Quest Button */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('QuestMap')}
      >
        <Text style={styles.primaryButtonText}>Continue Quest →</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ==========================================
// STYLISTIC STYLESHEET 
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFD166' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD166' },

  // Header Row
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 10 },
  headerIconContainer: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F1F1F', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#5C4033', marginTop: 1 },
  sparkleButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F' },

  // Status Bar (Hearts & Streak)
  statusBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  heartsRow: { flexDirection: 'row' },
  heartsRowCenter: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F' },
  streakText: { fontSize: 12, fontWeight: '900', color: '#1F1F1F' },

  // General Cards
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  levelCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  levelTitle: { fontSize: 18, fontWeight: '900', color: '#1F1F1F' },
  eggBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF9F5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1F1F1F' },
  xpText: { fontSize: 12, fontWeight: '800', color: '#555', marginBottom: 8 },
  progressBarTrack: { height: 12, backgroundColor: '#E9ECEF', borderRadius: 6, borderWidth: 2, borderColor: '#1F1F1F', overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 4 },
  levelFooterText: { fontSize: 10, fontWeight: '700', color: '#888' },

  // Stats Grid Row
  statsGridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statBox: { width: '48%', backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: '900', color: '#1F1F1F', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '800', color: '#555' },

  // Weekly Graph
  graphHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  graphTitle: { fontSize: 16, fontWeight: '900', color: '#1F1F1F' },
  graphTotalXp: { fontSize: 12, fontWeight: '900', color: '#FF6B35' },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 80, paddingTop: 10 },
  barColumn: { alignItems: 'center' },
  barPillar: { width: 22, backgroundColor: '#FFD166', borderRadius: 8, borderWidth: 2, borderColor: '#1F1F1F', marginBottom: 6 },
  activeBarPillar: { backgroundColor: '#FF6B35' },
  barDayLabel: { fontSize: 11, fontWeight: '900', color: '#1F1F1F' },

  // Out of Hearts Screen Specific Styles
  outOfHeartsHeading: { fontSize: 24, fontWeight: '900', color: '#1F1F1F', textAlign: 'center', marginBottom: 16 },
  timerCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  timerLabel: { fontSize: 10, fontWeight: '900', color: '#888', letterSpacing: 1, marginBottom: 4 },
  timerCountdown: { fontSize: 36, fontWeight: '900', color: '#1F1F1F', marginBottom: 6 },
  timerSubtext: { fontSize: 11, fontWeight: '700', color: '#555' },
  footerBackNote: { textAlign: 'center', fontSize: 11, fontWeight: '800', color: '#5C4033', marginTop: 14, marginBottom: 30 },

  // Primary Action Button
  primaryButton: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 18, alignItems: 'center', borderWidth: 2.5, borderColor: '#1F1F1F', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  primaryButtonText: { fontSize: 16, fontWeight: '900', color: '#FFF' }
});