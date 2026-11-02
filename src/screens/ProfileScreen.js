// ==========================================
// IMPORTS & DEPENDENCIES
// ==========================================
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DracoMascot from '../components/DracoMascot';

export default function ProfileScreen({ navigation }) {
  // ==========================================
  // STATE HOOKS FOR TABS, LOADING & MASCOT MOOD
  // ==========================================
  const [activeTab, setActiveTab] = useState('profile'); // Switches between 'profile' and 'trophies'
  const [loading, setLoading] = useState(true); // Controls loading spinner while fetching Firebase data
  const [dracoMood, setDracoMood] = useState('idle'); // Tracks Draco's facial reaction / animation mood

  // Initial adventurer state (first-time opening state with 0 XP)
  const [userData, setUserData] = useState({
    name: 'New Adventurer',
    level: 1,
    levelTitle: 'Egg',
    xp: 0,
    nextLevelXp: 100,
    completedQuests: 0,
    points: 0,
    evolutionTrack: 'Lv 1 Egg → Lv 3 Hatchling → Lv 5 Wingling',
  });

  // Initial topic mastery progress state (starts at 0% for brand new users)
  const [topicMastery, setTopicMastery] = useState([
    { title: 'Hello Python', progress: 0 },
    { title: 'Variables', progress: 0 },
    { title: 'Conditionals', progress: 0 },
    { title: 'Loops', progress: 0 },
    { title: 'Functions', progress: 0 },
  ]);

  // ==========================================
  // FETCH LIVE USER DATA FROM FIREBASE FIRESTORE
  // ==========================================
  useEffect(() => {
    async function fetchLiveProfileData() {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          // Retrieve the authenticated user's document from the Firestore 'users' collection
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const currentXp = data.xp || 0;
            
            // Calculate level dynamically based on XP milestones (Every 100 XP = 1 Level)
            const calculatedLevel = Math.floor(currentXp / 100) + 1;
            const levelTitle = calculatedLevel >= 5 ? 'Wingling' : calculatedLevel >= 3 ? 'Hatchling' : 'Egg';

            // Update user state with live data retrieved from Firestore
            setUserData({
              name: data.name || 'New Adventurer',
              level: calculatedLevel,
              levelTitle: levelTitle,
              xp: currentXp,
              nextLevelXp: calculatedLevel * 100,
              completedQuests: data.completedQuests || 0,
              points: data.points || currentXp,
              evolutionTrack: 'Lv 1 Egg → Lv 3 Hatchling → Lv 5 Wingling',
            });

            // Update topic mastery progress bars if topic data exists in Firestore
            if (data.topicProgress) {
              setTopicMastery(prev => prev.map(topic => {
                const match = Object.entries(data.topicProgress).find(([key]) => topic.title.toLowerCase().includes(key.toLowerCase()));
                return match ? { ...topic, progress: match[1].completed ? 100 : 0 } : topic;
              }));
            }
          }
        }
      } catch (error) {
        console.log("Error loading profile from Firebase:", error);
      } finally {
        setLoading(false); // Stop loading indicator once fetch completes
      }
    }
    fetchLiveProfileData();
  }, []);

  // Compute percentage progress toward the next level milestone
  const levelPercentage = Math.min(100, Math.round((userData.xp / userData.nextLevelXp) * 100));

  // Handle tap event on Draco mascot to trigger a temporary victory hop animation
  const handleDracoTap = () => {
    setDracoMood('success');
    setTimeout(() => setDracoMood('idle'), 1200);
  };

  // Render a loading spinner while profile data loads from Firestore
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        
        {/* ========================================== */}
        {/* TOP HEADER SECTION                         */}
        {/* ========================================== */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.headerIconContainer}
            onPress={() => setActiveTab(activeTab === 'profile' ? 'trophies' : 'profile')}
          >
            <FontAwesome5 name="code" size={18} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {activeTab === 'profile' ? 'Your adventurer' : 'Your trophy shelf'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === 'profile' ? 'GROW A LITTLE EVERY DAY' : '0 OF 6 ACHIEVEMENTS EARNED'}
            </Text>
          </View>

          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color="#1F1F1F" />
          </TouchableOpacity>
        </View>

        {/* ========================================== */}
        {/* TAB SWITCHER (Adventurer Profile vs Trophy Shelf) */}
        {/* ========================================== */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'profile' && styles.activeTabText]}>
              Adventurer Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'trophies' && styles.activeTabButton]}
            onPress={() => setActiveTab('trophies')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'trophies' && styles.activeTabText]}>
              Trophy Shelf
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conditional View Rendering based on active tab */}
        {activeTab === 'profile' ? (
          <>
            {/* ========================================== */}
            {/* ADVENTURER PROFILE CARD                    */}
            {/* ========================================== */}
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={48} color="#1F1F1F" />
              </View>
              
              <View style={styles.profileDetails}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userLevelTag}>
                  Level {userData.level} • {userData.levelTitle}
                </Text>
                <Text style={styles.userStatsMeta}>
                  {userData.xp} XP • {userData.completedQuests} quests • {userData.points} pts
                </Text>
              </View>

              <Text style={styles.evolutionTrackText}>{userData.evolutionTrack}</Text>
            </View>

            {/* ========================================== */}
            {/* LEVEL MILESTONE PROGRESS CARD              */}
            {/* ========================================== */}
            <View style={styles.milestoneCard}>
              <View style={styles.circularProgressBox}>
                <Text style={styles.percentageText}>{levelPercentage}%</Text>
              </View>

              <View style={styles.milestoneDetails}>
                <Text style={styles.milestoneTitle}>
                  Next stop: Level {userData.level + 1}
                </Text>
                <Text style={styles.milestoneSubtext}>
                  {userData.xp} / {userData.nextLevelXp} XP this level
                </Text>
                <Text style={styles.milestoneSubtext}>
                  {userData.nextLevelXp - userData.xp} XP to your next milestone.
                </Text>
              </View>
            </View>

            {/* ========================================== */}
            {/* TOPIC MASTERY PROGRESS LIST                */}
            {/* ========================================== */}
            <View style={styles.masteryCard}>
              <Text style={styles.cardHeaderTitle}>Topic mastery</Text>
              
              {topicMastery.map((topic, index) => (
                <View key={index} style={styles.topicRow}>
                  <Text style={styles.topicName}>{topic.title}</Text>
                  
                  <View style={styles.topicProgressTrack}>
                    <View style={[styles.topicProgressBar, { width: `${topic.progress}%` }]} />
                  </View>
                  
                  <Text style={styles.topicPercentage}>{topic.progress}%</Text>
                </View>
              ))}
            </View>

            {/* Interactive Draco Mascot with dynamic speech bubble message */}
            <DracoMascot 
              message={userData.xp === 0 ? "Your egg is resting. Complete your first quest to start hatching!" : `You have earned ${userData.xp} XP! Keep going!`} 
              mood={dracoMood} 
              onTap={handleDracoTap} 
            />
          </>
        ) : (
          <>
            {/* ========================================== */}
            {/* TROPHY SHELF & ACHIEVEMENTS VIEW           */}
            {/* ========================================== */}
            <DracoMascot 
              message="Small wins count! Complete quests and fix bugs to earn trophy badges." 
              mood={dracoMood} 
              onTap={handleDracoTap} 
            />
            
            <View style={styles.achievementsGrid}>
              {[
                { title: 'First steps', desc: 'Finish your first quest', progress: '0/1 quest', icon: 'footsteps-outline' },
                { title: 'Hello, Python!', desc: 'Complete Hello Python', progress: '0% complete', icon: 'code-slash-outline' },
                { title: 'Seven-day spark', desc: 'Practice 7 days in a row', progress: '0/7 days', icon: 'flame-outline' },
                { title: 'Bug hunter', desc: 'Fix 10 coding bugs', progress: '0 / 10 fixes', icon: 'bug-outline' },
                { title: 'Variable wizard', desc: 'Master Variables', progress: '0% mastered', icon: 'wand-outline' },
                { title: 'Loop legend', desc: 'Complete Loops', progress: 'Locked', icon: 'sync-outline' },
              ].map((badge, index) => (
                <View key={index} style={styles.badgeCard}>
                  <View style={styles.lockedBadgeIconBox}>
                    <Ionicons name={badge.icon} size={22} color="#888" />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeDescription}>{badge.desc}</Text>
                  <Text style={styles.badgeProgressText}>{badge.progress}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.gridFooterNote}>Keep learning. Your collection grows with you.</Text>
          </>
        )}

      </ScrollView>
    </View>
  );
}

// ==========================================
// STYLESHEET (Figma Spec Layout & Theme)
// ==========================================
const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: '#FFD166' },
  container: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFD166' },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 10 },
  headerIconContainer: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F1F1F', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 9, fontWeight: '800', color: '#5C4033', marginTop: 1 },
  settingsButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F' },

  tabToggleRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2.5, borderColor: '#1F1F1F', padding: 4, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 12 },
  activeTabButton: { backgroundColor: '#FF6B35' },
  tabButtonText: { fontSize: 12, fontWeight: '800', color: '#1F1F1F' },
  activeTabText: { color: '#FFF' },

  profileCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFD166', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 10, alignSelf: 'center' },
  profileDetails: { alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 20, fontWeight: '900', color: '#1F1F1F', marginBottom: 2 },
  userLevelTag: { fontSize: 13, fontWeight: '800', color: '#FF6B35', marginBottom: 4 },
  userStatsMeta: { fontSize: 11, fontWeight: '700', color: '#666' },
  evolutionTrackText: { textAlign: 'center', fontSize: 10, fontWeight: '800', color: '#888', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 },

  milestoneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  circularProgressBox: { width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  percentageText: { fontSize: 14, fontWeight: '900', color: '#1F1F1F' },
  milestoneDetails: { flex: 1 },
  milestoneTitle: { fontSize: 16, fontWeight: '900', color: '#1F1F1F', marginBottom: 2 },
  milestoneSubtext: { fontSize: 11, fontWeight: '700', color: '#555', lineHeight: 15 },

  masteryCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 22, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3 },
  cardHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#1F1F1F', marginBottom: 14 },
  topicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  topicName: { width: 90, fontSize: 12, fontWeight: '800', color: '#1F1F1F' },
  topicProgressTrack: { flex: 1, height: 10, backgroundColor: '#E9ECEF', borderRadius: 5, marginHorizontal: 10, overflow: 'hidden' },
  topicProgressBar: { height: '100%', backgroundColor: '#FF6B35', borderRadius: 5 },
  topicPercentage: { width: 35, fontSize: 11, fontWeight: '900', color: '#1F1F1F', textAlign: 'right' },

  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: '48%', backgroundColor: '#FFF', padding: 14, borderRadius: 20, borderWidth: 2.5, borderColor: '#1F1F1F', marginBottom: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 3 },
  lockedBadgeIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E9ECEF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1F1F1F', marginBottom: 8 },
  badgeTitle: { fontSize: 14, fontWeight: '900', color: '#1F1F1F', marginBottom: 2, textAlign: 'center' },
  badgeDescription: { fontSize: 10, fontWeight: '700', color: '#666', textAlign: 'center', marginBottom: 6, lineHeight: 13 },
  badgeProgressText: { fontSize: 9, fontWeight: '800', color: '#FF6B35', textAlign: 'center' },
  gridFooterNote: { textAlign: 'center', fontSize: 10, fontWeight: '800', color: '#5C4033', marginTop: 10, marginBottom: 20 }
});