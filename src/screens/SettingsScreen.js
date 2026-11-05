
// ============================================================================
// CODEQUEST SETTINGS SCREEN
// Handles account settings, progress reset, and user logout.
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function SettingsScreen({ navigation }) {

  // ==========================================================================
  // RESET QUEST PROGRESS
  // Resets the user's XP, points, hearts, topic mastery, weekly graph and trophies.
  // ==========================================================================

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

              Alert.alert(
                "Success",
                "All progress, mastery, weekly graphs, and trophies have been reset."
              );

            } catch (error) {
              console.error("Error resetting profile:", error);
            }
          }
        }
      ]
    );
  };

  // ==========================================================================
  // LOGOUT
  // Confirms before signing out the authenticated user.
  // ==========================================================================

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

  // ==========================================================================
  // RENDER SETTINGS SCREEN
  // ==========================================================================

  return (
    <View style={styles.screenWrapper}>

      {/* Header */}
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

        {/* Account Actions */}
        <Text style={styles.sectionHeader}>ACCOUNT ACTIONS</Text>

        {/* Reset Progress */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleResetProgress}
        >
          <View style={styles.orangeIconBox}>
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.settingTextGroup}>
            <Text style={styles.actionLabelOrange}>
              Reset Quest Progress
            </Text>

            <Text style={styles.settingSubtext}>
              Clear XP, points, mastery, weekly graph, and trophies
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleLogout}
        >
          <View style={styles.redIconBox}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          </View>

          <View style={styles.settingTextGroup}>
            <Text style={styles.actionLabelRed}>Log Out</Text>

            <Text style={styles.settingSubtext}>
              Sign out of your CodeQuest account session
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLESHEET (Neubrutalism Design Theme)
// ============================================================================

const styles = StyleSheet.create({
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

  settingTextGroup: {
    flex: 1,
    paddingRight: 10
  },

  settingSubtext: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666'
  },

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

  orangeIconBox: {
    backgroundColor: '#FF6B35',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    marginRight: 12
  },

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
