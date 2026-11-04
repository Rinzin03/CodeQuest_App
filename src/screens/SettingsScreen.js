// ============================================================================
// CODEQUEST SETTINGS SCREEN - WITH FIRESTORE SOUND PERSISTENCE
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function SettingsScreen({ navigation }) {
  // State for toggling sound effects on or off
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load initial sound preference from Firestore on mount
  useEffect(() => {
    async function loadSoundPreference() {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.soundEffectsEnabled !== undefined) {
            setSoundEnabled(data.soundEffectsEnabled);
          }
        }
      } catch (error) {
        console.error("Error loading sound preference:", error);
      }
    }
    loadSoundPreference();
  }, []);

  /**
   * Toggles audio feedback settings and updates Firestore instantly.
   */
  const handleToggleSound = async (value) => {
    setSoundEnabled(value);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        soundEffectsEnabled: value
      });
    } catch (error) {
      console.error("Error updating sound preference in Firestore:", error);
    }
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Quest Progress?",
      "Are you sure you want to reset all your stars, XP, points, topic mastery, weekly graph, and trophy shelf? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) return;
              const userRef = doc(db, 'users', userId);
              await updateDoc(userRef, {
                xp: 0,
                points: 0,
                completedQuests: 0,
                hearts: 5,
                topicProgress: {},
                trophies: [],
                weeklyXpGraph: [0, 0, 0, 0, 0, 0, 0]
              });
              Alert.alert("Success", "All progress, mastery, weekly graphs, and trophies have been reset.");
            } catch (error) {
              console.error("Error resetting profile:", error);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of CodeQuest?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await signOut(auth);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#1F1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingSubtext}>Enable audio feedback during quizzes and Draco interactions</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#FFE8A3', true: '#FF6B35' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#FFD166'}
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>ACCOUNT ACTIONS</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleResetProgress}>
          <View style={styles.orangeIconBox}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextGroup}>
            <Text style={styles.actionLabelOrange}>Reset Quest Progress</Text>
            <Text style={styles.settingSubtext}>Clear XP, points, mastery, weekly graph, and trophies</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={handleLogout}>
          <View style={styles.redIconBox}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextGroup}>
            <Text style={styles.actionLabelRed}>Log Out</Text>
            <Text style={styles.settingSubtext}>Sign out of your CodeQuest account session</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: '#FFD166' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  backButton: { backgroundColor: '#FFFFFF', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F1F1F' },
  contentContainer: { padding: 16, paddingBottom: 40 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: '#5C4033', marginTop: 12, marginBottom: 8, letterSpacing: 0.5 },
  settingCard: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 2.5, borderColor: '#1F1F1F', padding: 16, marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingTextGroup: { flex: 1, paddingRight: 10 },
  settingLabel: { fontSize: 16, fontWeight: '900', color: '#1F1F1F', marginBottom: 2 },
  settingSubtext: { fontSize: 11, fontWeight: '700', color: '#666666' },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 2.5, borderColor: '#1F1F1F', padding: 16, marginBottom: 12 },
  orangeIconBox: { backgroundColor: '#FF6B35', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 12 },
  redIconBox: { backgroundColor: '#E63946', padding: 8, borderRadius: 12, borderWidth: 2, borderColor: '#1F1F1F', marginRight: 12 },
  actionLabelOrange: { fontSize: 16, fontWeight: '900', color: '#FF6B35', marginBottom: 2 },
  actionLabelRed: { fontSize: 16, fontWeight: '900', color: '#E63946', marginBottom: 2 }
});