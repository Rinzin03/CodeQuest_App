// ============================================================================
// CODEQUEST SETTINGS SCREEN
// Manages app audio state, clears user progress in Firestore, and handles 
// Firebase authentication sign-out with a custom yellow/orange color scheme.
// ============================================================================

import React, { useState } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';

export default function SettingsScreen({ navigation }) {
  // State for toggling sound effects on or off
  const [soundEnabled, setSoundEnabled] = useState(true);

  /**
   * Toggles audio feedback settings for the app.
   */
  const handleToggleSound = () => {
    setSoundEnabled(previousState => !previousState);
  };

  /**
   * Resets all user progression metrics (XP, points, quests, topic mastery) in Firestore.
   */
  const handleResetProgress = () => {
    Alert.alert(
      "Reset Quest Progress?",
      "Are you sure you want to reset all your stars, XP, points, and topic mastery? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;
              if (!userId) {
                Alert.alert("Error", "No authenticated user found.");
                return;
              }

              // Reference to current user's document in Firestore and reset values
              const userRef = doc(db, 'users', userId);
              await updateDoc(userRef, {
                xp: 0,
                points: 0,
                completedQuests: 0,
                hearts: 5,
                topicProgress: {} // Clears level percentages
              });

              Alert.alert("Success", "Your progression has been successfully reset.");
            } catch (error) {
              console.error("Error resetting user progress in Firestore:", error);
              Alert.alert("Error", "Could not reset progress. Please try again.");
            }
          }
        }
      ]
    );
  };

  /**
   * Signs the user out of Firebase Authentication and returns them to the auth stack.
   */
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
            try {
              // Terminate the Firebase Auth session
              await signOut(auth);
            } catch (error) {
              console.error("Error signing out user:", error);
              Alert.alert("Error", "Could not log out. Please check your connection.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.screenWrapper}>
      
      {/* ================================================================== */}
      {/* HEADER SECTION WITH BACK BUTTON                                    */}
      {/* ================================================================== */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#1F1F1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        
        {/* ============================================================== */}
        {/* PREFERENCES SECTION (SOUND TOGGLE)                            */}
        {/* ============================================================== */}
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

        {/* ============================================================== */}
        {/* ACCOUNT ACTIONS (RESET ALL & LOGOUT)                           */}
        {/* ============================================================== */}
        <Text style={styles.sectionHeader}>ACCOUNT ACTIONS</Text>

        {/* Reset Progress Button */}
        <TouchableOpacity style={styles.actionCard} onPress={handleResetProgress}>
          <View style={styles.orangeIconBox}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextGroup}>
            <Text style={styles.actionLabelOrange}>Reset Quest Progress</Text>
            <Text style={styles.settingSubtext}>Clear XP, points, stars, and level topic mastery</Text>
          </View>
        </TouchableOpacity>

        {/* Log Out Button */}
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

// ============================================================================
// STYLESHEET (Yellow, Orange & White Theme)
// ============================================================================
const styles = StyleSheet.create({
  // Base Screen Background: Yellow (#FFD166)
  screenWrapper: { 
    flex: 1, 
    backgroundColor: '#FFD166' 
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 50, 
    paddingBottom: 16 
  },
  // Back Button Card: White (#FFFFFF)
  backButton: { 
    backgroundColor: '#FFFFFF', 
    padding: 8, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#1F1F1F', 
    marginRight: 12 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#1F1F1F' 
  },
  contentContainer: { 
    padding: 16, 
    paddingBottom: 40 
  },
  sectionHeader: { 
    fontSize: 11, 
    fontWeight: '900', 
    color: '#5C4033', 
    marginTop: 12, 
    marginBottom: 8, 
    letterSpacing: 0.5 
  },
  // Setting Card Container: White (#FFFFFF)
  settingCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 18, 
    borderWidth: 2.5, 
    borderColor: '#1F1F1F', 
    padding: 16, 
    marginBottom: 16 
  },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  settingTextGroup: { 
    flex: 1, 
    paddingRight: 10 
  },
  settingLabel: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: '#1F1F1F', 
    marginBottom: 2 
  },
  settingSubtext: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#666666' 
  },
  // Action Button Cards: White (#FFFFFF)
  actionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 18, 
    borderWidth: 2.5, 
    borderColor: '#1F1F1F', 
    padding: 16, 
    marginBottom: 12 
  },
  // Icon Container Pill: Bright Orange (#FF6B35)
  orangeIconBox: { 
    backgroundColor: '#FF6B35', 
    padding: 8, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#1F1F1F', 
    marginRight: 12 
  },
  // Logout Icon Pill: Darker Orange/Red (#E63946)
  redIconBox: { 
    backgroundColor: '#E63946', 
    padding: 8, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: '#1F1F1F', 
    marginRight: 12 
  },
  actionLabelOrange: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: '#FF6B35', 
    marginBottom: 2 
  },
  actionLabelRed: { 
    fontSize: 16, 
    fontWeight: '900', 
    color: '#E63946', 
    marginBottom: 2 
  }
});