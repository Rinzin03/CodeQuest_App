
// ============================================================================
// CODEQUEST HOME DASHBOARD
// LIVE TICKING & PERSISTENT HEART TIMER
//
// Features:
// 1. Refreshes Firebase user data whenever Home screen is focused.
// 2. Synchronizes heart recovery with Firestore.
// 3. Displays a live MM:SS countdown.
// 4. Calculates user level and XP progress.
// 5. Displays weekly XP, streaks and quest statistics.
// 6. Provides an out-of-hearts review screen.
// ============================================================================


// ============================================================================
// IMPORTS & DEPENDENCIES
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
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Persistent heart recovery service
import { checkAndRestoreHearts } from '../services/userService';

// Reusable Draco mascot component
import DracoMascot from '../components/DracoMascot';


export default function HomeScreen({ navigation }) {

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Controls the loading spinner
  const [loading, setLoading] = useState(true);

  // Controls Draco's facial expression and animation
  const [dracoMood, setDracoMood] = useState('idle');

  // Tracks whether Home screen is currently focused
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
    weeklyXp: [0, 0, 0, 0, 0, 0, 0],
    lastHeartLossTime: null
  });

  // Countdown state: 25 minutes = 1500 seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);


  // ==========================================================================
  // FETCH FIREBASE DATA WHENEVER HOME SCREEN IS FOCUSED
  // ==========================================================================

  // useFocusEffect runs whenever the user opens or returns to Home.
  // This ensures XP, hearts, quests and other statistics stay updated.

  useFocusEffect(
    useCallback(() => {

      // Mark the Home screen as active
      setIsFocused(true);

      // Prevent state updates if the screen loses focus during fetching
      let isActive = true;

      async function fetchUserHomeData() {

        try {

          // Display loading indicator during refresh
          setLoading(true);

          // Get authenticated user's Firebase UID
          const userId = auth.currentUser?.uid;

          if (!userId) {
            return;
          }

          // ----------------------------------------------------------
          // STEP 1: RESTORE HEARTS USING BACKEND SERVICE
          // ----------------------------------------------------------

          // Checks whether enough time has passed to restore lost hearts
          const currentRestoredHearts = await checkAndRestoreHearts();

          // ----------------------------------------------------------
          // STEP 2: FETCH LATEST USER DOCUMENT
          // ----------------------------------------------------------

          const userRef = doc(db, 'users', userId);

          const userDoc = await getDoc(userRef);

          if (!isActive) return;

          if (userDoc.exists()) {

            const data = userDoc.data();

            // Get current XP from Firestore
            const currentXp = Number(data.xp) || 0;

            // ------------------------------------------------------
            // STEP 3: CALCULATE USER LEVEL AND EVOLUTION
            // ------------------------------------------------------

            // Every 100 XP increases the user's level by one
            const calculatedLevel = Math.floor(currentXp / 100) + 1;

            // Determine Draco's evolution stage
            const levelTitle =
              calculatedLevel >= 5
                ? 'Wingling'
                : calculatedLevel >= 3
                ? 'Hatchling'
                : 'Egg';

            // ------------------------------------------------------
            // STEP 4: INITIALIZE HEART RECOVERY TIMER
            // ------------------------------------------------------

            let lossTime = data.lastHeartLossTime || null;

            // If hearts are empty but no timestamp exists,
            // create one so the recovery countdown can begin.
            if (currentRestoredHearts === 0 && !lossTime) {

              lossTime = Date.now();

              await updateDoc(userRef, {
                lastHeartLossTime: lossTime
              });
            }

            // Check again in case the screen lost focus during update
            if (!isActive) return;

            const REGEN_TIME_MS = 25 * 60 * 1000;

            // Calculate remaining seconds before the next heart
            let initialSecondsLeft = 25 * 60;

            if (lossTime && currentRestoredHearts < 5) {

              const elapsedMs = Date.now() - lossTime;

              const remainingMs =
                REGEN_TIME_MS - (elapsedMs % REGEN_TIME_MS);

              initialSecondsLeft = Math.max(
                0,
                Math.floor(remainingMs / 1000)
              );
            }

            // Update the countdown display
            setTimeLeft(initialSecondsLeft);

            // ------------------------------------------------------
            // STEP 5: UPDATE USER DASHBOARD STATISTICS
            // ------------------------------------------------------

            setUserData({

              name: data.name || 'Adventurer',

              level: calculatedLevel,

              levelTitle: levelTitle,

              xp: currentXp,

              nextLevelXp: calculatedLevel * 100,

              points: Number(data.points) || currentXp,

              questsDone: Number(data.completedQuests) || 0,

              streak: Number(data.streak) || 0,

              hearts: Math.max(
                0,
                Math.min(5, Number(currentRestoredHearts) || 0)
              ),

              // Ensure weekly XP always contains seven numeric values
              weeklyXp: Array.isArray(data.weeklyXp)
                ? Array.from({ length: 7 }, (_, index) =>
                    Number(data.weeklyXp[index]) || 0
                  )
                : [0, 0, 0, 0, 0, 0, 0],

              lastHeartLossTime: lossTime
            });
          }

        } catch (error) {

          // Log Firebase errors for debugging
          console.log(
            'Error fetching home stats from Firebase:',
            error
          );

        } finally {

          // Stop loading only if this screen is still active
          if (isActive) {
            setLoading(false);
          }
        }
      }

      // Execute Firebase fetching function
      fetchUserHomeData();

      // ----------------------------------------------------------
      // CLEANUP WHEN USER LEAVES HOME SCREEN
      // ----------------------------------------------------------

      return () => {

        isActive = false;

        // Mark Home screen as inactive
        setIsFocused(false);
      };

    }, [])
  );


  // ==========================================================================
  // LIVE HEART COUNTDOWN TIMER
  // ==========================================================================

  // This effect runs only while Home is focused and hearts are below 5.
  // Every second, the displayed countdown decreases by one.

  useEffect(() => {

    let timer = null;

    // Prevent asynchronous updates after the effect is cleaned up
    let isActive = true;

    if (isFocused && userData.hearts > 0 && userData.hearts < 5) {

      timer = setInterval(() => {

        setTimeLeft((prevTime) => {

          // When countdown reaches zero, check Firebase for restored hearts
          if (prevTime <= 1) {

            checkAndRestoreHearts()
              .then((newHearts) => {

                if (!isActive) return;

                // Update the latest heart count
                setUserData((prev) => ({

                  ...prev,

                  hearts: Math.max(
                    0,
                    Math.min(5, Number(newHearts) || 0)
                  )

                }));

              })
              .catch((error) => {
                console.log('Heart restoration error:', error);
              });

            // Reset countdown for the next recovery cycle
            return 25 * 60;
          }

          // Decrease countdown by one second
          return prevTime - 1;

        });

      }, 1000);
    }

    // Clear interval when leaving Home or when hearts change
    return () => {

      isActive = false;

      if (timer) {
        clearInterval(timer);
      }

    };

  }, [isFocused, userData.hearts]);


  // ==========================================================================
  // FORMAT COUNTDOWN INTO MM:SS
  // ==========================================================================

  // Converts seconds into a digital clock format
  const formatTime = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  // ==========================================================================
  // DRACO MASCOT INTERACTION
  // ==========================================================================

  // Changes Draco's mood temporarily when the user taps the mascot
  const handleDracoTap = () => {

    setDracoMood('success');

    setTimeout(() => {
      setDracoMood('idle');
    }, 1200);
  };


  // ==========================================================================
  // LOADING SCREEN
  // ==========================================================================

  if (loading) {

    return (

      <View style={styles.centerContainer}>

        <ActivityIndicator
          size="large"
          color="#FF6B35"
        />

      </View>
    );
  }


  // ==========================================================================
  // VIEW 1: OUT-OF-HEARTS SCREEN
  // ==========================================================================

  // Display this screen when the user has no remaining hearts

  if (userData.hearts === 0) {

    return (

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >

        {/* HEADER ROW */}

        <View style={styles.headerRow}>

          <View style={styles.headerIconContainer}>

            <FontAwesome5
              name="code"
              size={18}
              color="#FFF"
            />

          </View>

          <View style={styles.headerTextContainer}>

            <Text style={styles.headerTitle}>
              Time for a breather
            </Text>

            <Text style={styles.headerSubtitle}>
              YOUR PROGRESS IS SAFE
            </Text>

          </View>

          <TouchableOpacity style={styles.sparkleButton}>

            <MaterialCommunityIcons
              name="star-four-points"
              size={18}
              color="#1F1F1F"
            />

          </TouchableOpacity>

        </View>


        {/* EMPTY HEARTS ROW */}

        <View style={styles.heartsRowCenter}>

          {Array.from({ length: 5 }).map((_, i) => (

            <Ionicons
              key={i}
              name="heart-outline"
              size={26}
              color="#1F1F1F"
              style={{ marginHorizontal: 4 }}
            />

          ))}

        </View>


        <Text style={styles.outOfHeartsHeading}>
          Out of hearts
        </Text>


        {/* LIVE COUNTDOWN TIMER CARD */}

        <View style={styles.timerCard}>

          <Ionicons
            name="time-outline"
            size={22}
            color="#1F1F1F"
            style={{ marginBottom: 4 }}
          />

          <Text style={styles.timerLabel}>
            NEXT HEART IN
          </Text>

          {/* Live countdown display */}

          <Text style={styles.timerCountdown}>
            {formatTime(timeLeft)}
          </Text>

          <Text style={styles.timerSubtext}>
            Watch the countdown tick down live—your energy is restoring!
          </Text>

        </View>


        {/* DRACO MASCOT GUIDANCE */}

        <DracoMascot
          message="Mistakes help you learn! Take a quick rest while your energy recharges."
          mood="sad"
          onTap={handleDracoTap}
        />


        {/* PYTHON REVIEW BUTTON */}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('QuestMap')}
        >

          <Text style={styles.primaryButtonText}>
            Review Python Basics →
          </Text>

        </TouchableOpacity>


        {/* HEARTS RESTORE AUTOMATICALLY */}

        <Text style={styles.footerBackNote}>
          Your hearts will restore automatically. Your progress is safe!
        </Text>

      </ScrollView>
    );
  }


  // ==========================================================================
  // VIEW 2: MAIN HOME DASHBOARD
  // ==========================================================================

  // Calculate XP earned within the current level
  const currentLevelXp = userData.xp % 100;

  // Calculate percentage progress toward the next level
  const levelPercentage = Math.round(
    (currentLevelXp / 100) * 100
  );


  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >

      {/* ============================================================ */}
      {/* TOP GREETING HEADER                                          */}
      {/* ============================================================ */}

      <View style={styles.headerRow}>

        <View style={styles.headerIconContainer}>

          <FontAwesome5
            name="code"
            size={18}
            color="#FFF"
          />

        </View>

        <View style={styles.headerTextContainer}>

          <Text style={styles.headerTitle}>
            Hey, {userData.name}!
          </Text>

          <Text style={styles.headerSubtitle}>
            LET'S MAKE A LITTLE PROGRESS
          </Text>

        </View>

        <TouchableOpacity style={styles.sparkleButton}>

          <MaterialCommunityIcons
            name="star-four-points"
            size={18}
            color="#1F1F1F"
          />

        </TouchableOpacity>

      </View>


      {/* ============================================================ */}
      {/* HEARTS BAR AND STREAK COUNTER                                */}
      {/* ============================================================ */}

      <View style={styles.statusBarRow}>

        {/* Display five heart icons */}

        <View style={styles.heartsRow}>

          {Array.from({ length: 5 }).map((_, i) => (

            <Ionicons
              key={i}
              name={
                i < userData.hearts
                  ? 'heart'
                  : 'heart-outline'
              }
              size={22}
              color="#E63946"
              style={{ marginRight: 2 }}
            />

          ))}

        </View>


        {/* Display user's learning streak */}

        <View style={styles.streakBadge}>

          <Ionicons
            name="flame"
            size={16}
            color="#FF6B35"
            style={{ marginRight: 4 }}
          />

          <Text style={styles.streakText}>
            {userData.streak}-day streak
          </Text>

        </View>

      </View>


      {/* ============================================================ */}
      {/* LEVEL AND XP PROGRESS CARD                                   */}
      {/* ============================================================ */}

      <View style={styles.card}>

        <View style={styles.levelCardTop}>

          <Text style={styles.levelTitle}>
            Level {userData.level} • {userData.levelTitle}
          </Text>

          <View style={styles.eggBadge}>
            <Text style={{ fontSize: 12 }}>
              🥚
            </Text>
          </View>

        </View>


        <Text style={styles.xpText}>
          {currentLevelXp} / 100 XP
        </Text>


        {/* XP progress bar */}

        <View style={styles.progressBarTrack}>

          <View
            style={[
              styles.progressBarFill,
              { width: `${levelPercentage}%` }
            ]}
          />

        </View>


        <Text style={styles.levelFooterText}>
          {100 - currentLevelXp} XP until Level {userData.level + 1} ({userData.xp} total XP)
        </Text>

      </View>


      {/* ============================================================ */}
      {/* USER STATISTICS: POINTS AND COMPLETED QUESTS                 */}
      {/* ============================================================ */}

      <View style={styles.statsGridRow}>

        <View style={styles.statBox}>

          <Text style={styles.statNumber}>
            {userData.points}
          </Text>

          <Text style={styles.statLabel}>
            Quest points
          </Text>

        </View>


        <View style={styles.statBox}>

          <Text style={styles.statNumber}>
            {userData.questsDone}
          </Text>

          <Text style={styles.statLabel}>
            Quests done
          </Text>

        </View>

      </View>


      {/* ============================================================ */}
      {/* WEEKLY XP ACTIVITY GRAPH                                     */}
      {/* ============================================================ */}

      <View style={styles.card}>

        <View style={styles.graphHeaderRow}>

          <Text style={styles.graphTitle}>
            Your week in XP
          </Text>

          <Text style={styles.graphTotalXp}>
            {userData.weeklyXp.reduce((a, b) => a + b, 0)} XP
          </Text>

        </View>


        {/* Seven-day XP bar chart */}

        <View style={styles.barChartContainer}>

          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {

            // Determine bar height based on XP earned
            const barHeight = Math.max(
              12,
              Math.min(70, userData.weeklyXp[index])
            );

            // Highlight the last day as in the original design
            const isToday = index === 6;

            return (

              <View
                key={index}
                style={styles.barColumn}
              >

                <View
                  style={[
                    styles.barPillar,
                    { height: barHeight },
                    isToday && styles.activeBarPillar
                  ]}
                />

                <Text style={styles.barDayLabel}>
                  {day}
                </Text>

              </View>

            );

          })}

        </View>

      </View>


      {/* ============================================================ */}
      {/* DRACO COMPANION BANNER                                       */}
      {/* ============================================================ */}

      <DracoMascot
        message="A variable is a name for a value. Let's give your code a memory!"
        mood={dracoMood}
        onTap={handleDracoTap}
      />


      {/* ============================================================ */}
      {/* PRIMARY NAVIGATION BUTTON                                    */}
      {/* ============================================================ */}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('QuestMap')}
      >

        <Text style={styles.primaryButtonText}>
          Continue Quest →
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}


// ============================================================================
// STYLESHEET - NEUBRUTALISM DESIGN THEME
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


  // HEADER ROW

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


  // HEARTS AND STREAK

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


  // GENERAL CARDS

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


  // LEVEL AND XP

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


  // STATISTICS GRID

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


  // WEEKLY XP GRAPH

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
    height: 80,
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


  // OUT-OF-HEARTS SCREEN

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

  footerBackNote: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#5C4033',
    marginTop: 14,
    marginBottom: 30
  },


  // PRIMARY ACTION BUTTON

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
