// ============================================================================
// CODEQUEST HOME DASHBOARD - LIVE STATS, HEARTS & WEEKLY XP GRAPH
// Handles real-time Firestore synchronization for daily XP bar graph tracking,
// heart regeneration countdowns, user levels, and streak counters.
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';

import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons';

// Runs a callback whenever the screen becomes active
import { useFocusEffect } from '@react-navigation/native';

// Firebase services
import { db, auth } from '../services/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

// Persistent heart recovery service
import { checkAndRestoreHearts } from '../services/userService';

// Reusable Draco mascot component
import DracoMascot from '../components/DracoMascot';


export default function HomeScreen({ navigation }) {

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const [loading, setLoading] = useState(true);
  const [dracoMood, setDracoMood] = useState('idle');
  const [isFocused, setIsFocused] = useState(false);

  // Stores user statistics retrieved from Firebase
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
    weeklyXp: [0, 0, 0, 0, 0, 0, 0], // Monday through Sunday XP breakdown
    lastHeartLossTime: null
  });

  // Countdown state: 25 minutes = 1500 seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);


  // ==========================================================================
  // FETCH FIREBASE DATA & SET UP REAL-TIME LISTENER ON HOME FOCUS
  // ==========================================================================

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      let isActive = true;

      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, 'users', userId);

      async function initializeHomeData() {
        try {
          setLoading(true);

          // 1. Restore hearts check
          const currentRestoredHearts = await checkAndRestoreHearts();

          // 2. Fetch initial user document snapshot
          const userDoc = await getDoc(userRef);
          if (!isActive || !userDoc.exists()) return;

          const data = userDoc.data();
          const currentXp = Number(data.xp) || 0;
          const calculatedLevel = Math.floor(currentXp / 100) + 1;

          const levelTitle =
            calculatedLevel >= 5
              ? 'Wingling'
              : calculatedLevel >= 3
              ? 'Hatchling'
              : 'Egg';

          // 3. Robustly parse weekly XP array (Monday to Sunday)
          let graphData = [0, 0, 0, 0, 0, 0, 0];
          if (Array.isArray(data.weeklyXp)) {
            graphData = data.weeklyXp.map(val => Number(val) || 0);
            while (graphData.length < 7) graphData.push(0);
            if (graphData.length > 7) graphData = graphData.slice(0, 7);
          }

          setUserData({
            name: data.name || 'Adventurer',
            level: calculatedLevel,
            levelTitle: levelTitle,
            xp: currentXp,
            nextLevelXp: calculatedLevel * 100,
            points: Number(data.points) || currentXp,
            questsDone: Number(data.completedQuests) || 0,
            streak: Number(data.streak) || 0,
            hearts: Math.max(0, Math.min(5, Number(currentRestoredHearts) || 0)),
            weeklyXp: graphData,
            lastHeartLossTime: data.lastHeartLossTime || null
          });

        } catch (error) {
          console.log('Error loading home data:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      }

      initializeHomeData();

      // ======================================================================
      // REAL-TIME FIRESTORE LISTENER (onSnapshot)
      // Instantly updates the weekly XP graph when a quiz updates Firestore.
      // ======================================================================
      const unsubscribe = onSnapshot(
        userRef,
        (docSnap) => {
          if (!docSnap.exists() || !isActive) return;
          const data = docSnap.data();

          let liveGraphData = [0, 0, 0, 0, 0, 0, 0];
          if (Array.isArray(data.weeklyXp)) {
            liveGraphData = data.weeklyXp.map(val => Number(val) || 0);
            while (liveGraphData.length < 7) liveGraphData.push(0);
            if (liveGraphData.length > 7) liveGraphData = liveGraphData.slice(0, 7);
          }

          setUserData(prev => ({
            ...prev,
            weeklyXp: liveGraphData,
            xp: Number(data.xp) || prev.xp,
            points: Number(data.points) || prev.points,
            questsDone: Number(data.completedQuests) || prev.questsDone,
            hearts: data.hearts !== undefined ? Number(data.hearts) : prev.hearts
          }));
        },
        (error) => {
          console.log('Real-time snapshot error:', error);
        }
      );

      // Cleanup subscription when screen loses focus
      return () => {
        isActive = false;
        setIsFocused(false);
        unsubscribe();
      };
    }, [])
  );


  // ==========================================================================
  // LIVE HEART COUNTDOWN TIMER
  // ==========================================================================

  useEffect(() => {
    let timer = null;
    let isActive = true;

    if (isFocused && userData.hearts > 0 && userData.hearts < 5) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            checkAndRestoreHearts()
              .then((newHearts) => {
                if (!isActive) return;
                setUserData((prev) => ({
                  ...prev,
                  hearts: Math.max(0, Math.min(5, Number(newHearts) || 0))
                }));
              })
              .catch((err) => console.log('Timer restore error:', err));
            return 25 * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      isActive = false;
      if (timer) clearInterval(timer);
    };
  }, [isFocused, userData.hearts]);


  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDracoTap = () => {
    setDracoMood('success');
    setTimeout(() => {
      setDracoMood('idle');
    }, 1200);
  };


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }


  // ==========================================================================
  // VIEW: OUT-OF-HEARTS SCREEN
  // ==========================================================================

  if (userData.hearts === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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

        <View style={styles.heartsRowCenter}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons key={i} name="heart-outline" size={26} color="#1F1F1F" style={{ marginHorizontal: 4 }} />
          ))}
        </View>

        <Text style={styles.outOfHeartsHeading}>Out of hearts</Text>

        <View style={styles.timerCard}>
          <Ionicons name="time-outline" size={22} color="#1F1F1F" style={{ marginBottom: 4 }} />
          <Text style={styles.timerLabel}>NEXT HEART IN</Text>
          <Text style={styles.timerCountdown}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerSubtext}>Your energy is restoring automatically!</Text>
        </View>

        <DracoMascot message="Mistakes help you learn! Take a quick rest while your energy recharges." mood="sad" onTap={handleDracoTap} />

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('QuestMap')}>
          <Text style={styles.primaryButtonText}>Review Python Basics →</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }


  // ==========================================================================
  // VIEW: MAIN HOME DASHBOARD
  // ==========================================================================

  const currentLevelXp = userData.xp % 100;
  const levelPercentage = Math.round((currentLevelXp / 100) * 100);

  // Map JS getDay() (0=Sun, 1=Mon...6=Sat) to Monday-starting index (0=Mon...6=Sun)
  const jsDay = new Date().getDay();
  const todayIndex = (jsDay + 6) % 7;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* HEADER ROW */}
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

      {/* HEARTS & STREAK ROW */}
      <View style={styles.statusBarRow}>
        <View style={styles.heartsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < userData.hearts ? 'heart' : 'heart-outline'}
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

      {/* LEVEL & XP PROGRESS CARD */}
      <View style={styles.card}>
        <View style={styles.levelCardTop}>
          <Text style={styles.levelTitle}>Level {userData.level} • {userData.levelTitle}</Text>
          <View style={styles.eggBadge}>
            <Text style={{ fontSize: 12 }}>🥚</Text>
          </View>
        </View>

        <Text style={styles.xpText}>{currentLevelXp} / 100 XP</Text>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${levelPercentage}%` }]} />
        </View>

        <Text style={styles.levelFooterText}>
          {100 - currentLevelXp} XP until Level {userData.level + 1} ({userData.xp} total XP)
        </Text>
      </View>

      {/* STATS GRID */}
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

      {/* ========================================================== */}
      {/* WEEKLY XP ACTIVITY GRAPH CARD                              */}
      {/* Automatically highlights today and updates live from Firestore */}
      {/* ========================================================== */}
      <View style={styles.card}>
        <View style={styles.graphHeaderRow}>
          <Text style={styles.graphTitle}>Your week in XP</Text>
          <Text style={styles.graphTotalXp}>
            {userData.weeklyXp.reduce((total, xp) => total + xp, 0)} XP
          </Text>
        </View>

        <View style={styles.barChartContainer}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
            const dailyXp = Number(userData.weeklyXp[index]) || 0;
            const maximumXp = Math.max(...userData.weeklyXp, 1);
            const barHeight = Math.max(12, (dailyXp / maximumXp) * 70);
            const isToday = index === todayIndex;

            return (
              <View key={index} style={styles.barColumn}>
                <View
                  style={[
                    styles.barPillar,
                    { height: barHeight },
                    isToday && styles.activeBarPillar
                  ]}
                />
                <Text style={[styles.barDayLabel, isToday && { color: '#FF6B35' }]}>
                  {day}
                </Text>
                <Text style={styles.dailyXpLabel}>{dailyXp}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* DRACO COMPANION */}
      <DracoMascot
        message="A variable is a name for a value. Let's give your code a memory!"
        mood={dracoMood}
        onTap={handleDracoTap}
      />

      {/* CONTINUE BUTTON */}
      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('QuestMap')}>
        <Text style={styles.primaryButtonText}>Continue Quest →</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}


// ============================================================================
// STYLESHEET (Neubrutalism Theme)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD166'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD166'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 10
  },
  headerIconContainer: {
    backgroundColor: '#FF6B35',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    marginRight: 10
  },
  headerTextContainer: {
    flex: 1
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1F1F',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5C4033',
    marginTop: 1
  },
  sparkleButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F'
  },
  statusBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  heartsRow: {
    flexDirection: 'row'
  },
  heartsRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F'
  },
  streakText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F1F1F'
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  levelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F1F1F'
  },
  eggBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF9F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F1F1F'
  },
  xpText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555',
    marginBottom: 8
  },
  progressBarTrack: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    overflow: 'hidden',
    marginBottom: 8
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 4
  },
  levelFooterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888'
  },
  statsGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  statBox: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555'
  },
  graphHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F1F1F'
  },
  graphTotalXp: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FF6B35'
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 10
  },
  barColumn: {
    alignItems: 'center'
  },
  barPillar: {
    width: 22,
    backgroundColor: '#FFD166',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    marginBottom: 6
  },
  activeBarPillar: {
    backgroundColor: '#FF6B35'
  },
  barDayLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1F1F1F'
  },
  dailyXpLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#555',
    marginTop: 3
  },
  outOfHeartsHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F1F1F',
    textAlign: 'center',
    marginBottom: 16
  },
  timerCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4
  },
  timerCountdown: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 6
  },
  timerSubtext: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    textAlign: 'center'
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF'
  }
});