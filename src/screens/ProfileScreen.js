// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
import React, { useState, useCallback } from 'react';

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
  FontAwesome5
} from '@expo/vector-icons';

// useFocusEffect allows the screen to refresh whenever it becomes active
import { useFocusEffect } from '@react-navigation/native';

// Firebase imports
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Draco mascot component
import DracoMascot from '../components/DracoMascot';


export default function ProfileScreen({ navigation }) {

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  // Controls switching between Profile and Trophy Shelf tabs
  const [activeTab, setActiveTab] = useState('profile');

  // Displays loading indicator while fetching Firebase data
  const [loading, setLoading] = useState(true);

  // Controls Draco mascot's mood and animation
  const [dracoMood, setDracoMood] = useState('idle');

  // Stores the authenticated user's profile information
  const [userData, setUserData] = useState({
    name: 'New Adventurer',
    level: 1,
    levelTitle: 'Egg',
    xp: 0,
    nextLevelXp: 100,
    completedQuests: 0,
    points: 0,
    evolutionTrack: 'Lv 1 Egg → Lv 3 Hatchling → Lv 5 Wingling'
  });

  // Stores progress for individual Python learning topics mapped to Firestore topic IDs
  const [topicMastery, setTopicMastery] = useState([
    { id: 'topic_1', title: 'Hello Python', progress: 0 },
    { id: 'topic_2', title: 'Variables', progress: 0 },
    { id: 'topic_3', title: 'Conditionals', progress: 0 },
    { id: 'topic_4', title: 'Loops', progress: 0 },
    { id: 'topic_5', title: 'Functions', progress: 0 }
  ]);

  // Stores trophy information retrieved from Firebase
  const [trophies, setTrophies] = useState([]);


  // ==========================================
  // FETCH PROFILE DATA WHEN SCREEN IS FOCUSED
  // ==========================================

  // useFocusEffect runs whenever the user navigates to this screen or returns from a quiz.
  useFocusEffect(
    useCallback(() => {

      // Prevents state updates if the screen loses focus during fetching
      let isActive = true;

      async function fetchProfileData() {

        try {
          setLoading(true);

          // Get the currently authenticated user's Firebase UID
          const userId = auth.currentUser?.uid;

          if (!userId) {
            return;
          }

          // Retrieve the user's document from Firestore
          const userDoc = await getDoc(doc(db, 'users', userId));

          // Continue only if the document exists and screen is active
          if (userDoc.exists() && isActive) {

            const data = userDoc.data();

            // Get current XP, defaulting to zero for new users
            const currentXp = Number(data.xp) || 0;

            // Calculate level based on every 100 XP earned
            const calculatedLevel = Math.floor(currentXp / 100) + 1;

            // Determine Draco's evolution stage
            const levelTitle =
              calculatedLevel >= 5
                ? 'Wingling'
                : calculatedLevel >= 3
                ? 'Hatchling'
                : 'Egg';

            // Update the profile information state
            setUserData({
              name: data.name || 'New Adventurer',
              level: calculatedLevel,
              levelTitle: levelTitle,
              xp: currentXp,
              nextLevelXp: calculatedLevel * 100,
              completedQuests: Number(data.completedQuests) || 0,
              points: Number(data.points) || currentXp,
              evolutionTrack: 'Lv 1 Egg → Lv 3 Hatchling → Lv 5 Wingling'
            });

            // ==========================================
            // UPDATE TOPIC MASTERY PROGRESS FROM FIRESTORE
            // ==========================================
            setTopicMastery(prev =>
              prev.map(topic => {
                const match = data.topicProgress ? data.topicProgress[topic.id] : null;
                if (match) {
                  // Pull pre-calculated percentage from Firestore topic object or compute it
                  const percentage = match.percentage !== undefined 
                    ? match.percentage 
                    : Math.round(((match.completedModes?.length || 0) / 3) * 100);
                  return {
                    ...topic,
                    progress: percentage
                  };
                }
                // If no entry exists in Firestore (such as after a reset), explicitly reset progress to 0
                return {
                  ...topic,
                  progress: 0
                };
              })
            );

            // ==========================================
            // UPDATE TROPHY INFORMATION
            // ==========================================
            if (Array.isArray(data.trophies)) {
              setTrophies(data.trophies);
            } else {
              setTrophies([]);
            }
          }

        } catch (error) {
          console.log('Error loading profile from Firebase:', error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      fetchProfileData();

      // Cleanup function runs when screen loses focus
      return () => {
        isActive = false;
      };

    }, [])
  );


  // ==========================================
  // CALCULATE LEVEL PROGRESS
  // ==========================================

  // Calculate percentage of XP earned toward the next level (0 to 100)
  const currentLevelXp = userData.xp % 100;
  const levelPercentage = Math.round((currentLevelXp / 100) * 100);


  // ==========================================
  // DRACO MASCOT INTERACTION
  // ==========================================

  const handleDracoTap = () => {
    setDracoMood('success');
    setTimeout(() => {
      setDracoMood('idle');
    }, 1200);
  };


  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }


  // ==========================================
  // MAIN PROFILE SCREEN
  // ==========================================

  return (
    <View style={styles.screenWrapper}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >

        {/* ========================================== */}
        {/* TOP HEADER SECTION                         */}
        {/* ========================================== */}

        <View style={styles.headerRow}>

          <TouchableOpacity
            style={styles.headerIconContainer}
            onPress={() =>
              setActiveTab(
                activeTab === 'profile' ? 'trophies' : 'profile'
              )
            }
          >
            <FontAwesome5
              name="code"
              size={18}
              color="#FFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {activeTab === 'profile' ? 'Your adventurer' : 'Your trophy shelf'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === 'profile' ? 'GROW A LITTLE EVERY DAY' : `${trophies.length} ACHIEVEMENTS EARNED`}
            </Text>
          </View>

          {/* ========================================== */}
          {/* CLICKABLE TOP SETTINGS GEAR ICON BUTTON    */}
          {/* Navigates user to the SettingsScreen stack */}
          {/* ========================================== */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color="#1F1F1F"
            />
          </TouchableOpacity>

        </View>


        {/* ========================================== */}
        {/* PROFILE AND TROPHY TAB SWITCHER            */}
        {/* ========================================== */}

        <View style={styles.tabToggleRow}>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'profile' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'profile' && styles.activeTabText
            ]}>
              Adventurer Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'trophies' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('trophies')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'trophies' && styles.activeTabText
            ]}>
              Trophy Shelf
            </Text>
          </TouchableOpacity>

        </View>


        {/* ========================================== */}
        {/* CONDITIONAL PROFILE / TROPHY CONTENT       */}
        {/* ========================================== */}

        {activeTab === 'profile' ? (

          <>

            {/* ADVENTURER PROFILE CARD */}
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Ionicons
                  name="person"
                  size={48}
                  color="#1F1F1F"
                />
              </View>

              <View style={styles.profileDetails}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userLevelTag}>Level {userData.level} • {userData.levelTitle}</Text>
                <Text style={styles.userStatsMeta}>
                  {userData.xp} XP • {userData.completedQuests} quests • {userData.points} pts
                </Text>
              </View>

              <Text style={styles.evolutionTrackText}>
                {userData.evolutionTrack}
              </Text>
            </View>


            {/* LEVEL MILESTONE PROGRESS CARD */}
            <View style={styles.milestoneCard}>
              <View style={styles.circularProgressBox}>
                <Text style={styles.percentageText}>{levelPercentage}%</Text>
              </View>

              <View style={styles.milestoneDetails}>
                <Text style={styles.milestoneTitle}>
                  Next stop: Level {userData.level + 1}
                </Text>
                <Text style={styles.milestoneSubtext}>
                  {currentLevelXp} / 100 XP this level
                </Text>
                <Text style={styles.milestoneSubtext}>
                  {100 - currentLevelXp} XP to your next milestone.
                </Text>
              </View>
            </View>


            {/* TOPIC MASTERY PROGRESS DASHBOARD */}
            <View style={styles.masteryCard}>
              <Text style={styles.cardHeaderTitle}>Topic mastery</Text>

              {topicMastery.map((topic, index) => (
                <View key={index} style={styles.topicRow}>
                  <Text style={styles.topicName}>{topic.title}</Text>

                  <View style={styles.topicProgressTrack}>
                    <View
                      style={[
                        styles.topicProgressBar,
                        { width: `${topic.progress}%` }
                      ]}
                    />
                  </View>

                  <Text style={styles.topicPercentage}>{topic.progress}%</Text>
                </View>
              ))}
            </View>


            {/* INTERACTIVE DRACO MASCOT */}
            <DracoMascot
              message={
                userData.xp === 0
                  ? "Your egg is resting. Complete your first quest to start hatching!"
                  : `You have earned ${userData.xp} XP! Keep going!`
              }
              mood={dracoMood}
              onTap={handleDracoTap}
            />

          </>

        ) : (

          <>

            {/* TROPHY SHELF MASCOT */}
            <DracoMascot
              message="Small wins count! Complete quests and fix bugs to earn trophy badges."
              mood={dracoMood}
              onTap={handleDracoTap}
            />


            {/* ACHIEVEMENTS GRID */}
            <View style={styles.achievementsGrid}>

              {[
                {
                  title: 'First steps',
                  desc: 'Finish your first quest',
                  progress: `${userData.completedQuests > 0 ? 1 : 0}/1 quest`,
                  icon: 'footsteps-outline',
                  earned: userData.completedQuests > 0
                },
                {
                  title: 'Hello, Python!',
                  desc: 'Complete Hello Python',
                  progress: `${topicMastery[0]?.progress || 0}% complete`,
                  icon: 'code-slash-outline',
                  earned: (topicMastery[0]?.progress || 0) === 100
                },
                {
                  title: 'Seven-day spark',
                  desc: 'Practice 7 days in a row',
                  progress: '0/7 days',
                  icon: 'flame-outline',
                  earned: false
                },
                {
                  title: 'Bug hunter',
                  desc: 'Fix 10 coding bugs',
                  progress: '0 / 10 fixes',
                  icon: 'bug-outline',
                  earned: false
                },
                {
                  title: 'Variable wizard',
                  desc: 'Master Variables',
                  progress: `${topicMastery[1]?.progress || 0}% mastered`,
                  icon: 'wand-outline',
                  earned: (topicMastery[1]?.progress || 0) === 100
                },
                {
                  title: 'Loop legend',
                  desc: 'Complete Loops',
                  progress: `${topicMastery[3]?.progress || 0}% complete`,
                  icon: 'sync-outline',
                  earned: (topicMastery[3]?.progress || 0) === 100
                }

              ].map((badge, index) => (

                <View key={index} style={styles.badgeCard}>
                  <View
                    style={[
                      styles.lockedBadgeIconBox,
                      badge.earned && styles.earnedBadgeIconBox
                    ]}
                  >
                    <Ionicons
                      name={badge.icon}
                      size={22}
                      color={badge.earned ? '#FF6B35' : '#888'}
                    />
                  </View>

                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeDescription}>{badge.desc}</Text>
                  <Text style={styles.badgeProgressText}>
                    {badge.earned ? 'Earned!' : badge.progress}
                  </Text>
                </View>

              ))}

            </View>

            <Text style={styles.gridFooterNote}>
              Keep learning. Your collection grows with you.
            </Text>

          </>

        )}

      </ScrollView>

    </View>
  );
}


// ==========================================
// STYLESHEET
// ==========================================

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#FFD166'
  },
  container: {
    flex: 1
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
  settingsButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F'
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    padding: 4,
    marginBottom: 16
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12
  },
  activeTabButton: {
    backgroundColor: '#FF6B35'
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F1F1F'
  },
  activeTabText: {
    color: '#FFF'
  },
  profileCard: {
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
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    marginBottom: 10,
    alignSelf: 'center'
  },
  profileDetails: {
    alignItems: 'center',
    marginBottom: 10
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 2
  },
  userLevelTag: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 4
  },
  userStatsMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666'
  },
  evolutionTrackText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 8
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  circularProgressBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    borderColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F1F1F'
  },
  milestoneDetails: {
    flex: 1
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 2
  },
  milestoneSubtext: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    lineHeight: 15
  },
  masteryCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 14
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  topicName: {
    width: 90,
    fontSize: 12,
    fontWeight: '800',
    color: '#1F1F1F'
  },
  topicProgressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden'
  },
  topicProgressBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 5
  },
  topicPercentage: {
    width: 35,
    fontSize: 11,
    fontWeight: '900',
    color: '#1F1F1F',
    textAlign: 'right'
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#1F1F1F',
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3
  },
  lockedBadgeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F1F1F',
    marginBottom: 8
  },
  earnedBadgeIconBox: {
    backgroundColor: '#FFD166'
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F1F1F',
    marginBottom: 2,
    textAlign: 'center'
  },
  badgeDescription: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 13
  },
  badgeProgressText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF6B35',
    textAlign: 'center'
  },
  gridFooterNote: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#5C4033',
    marginTop: 10,
    marginBottom: 20
  }
});