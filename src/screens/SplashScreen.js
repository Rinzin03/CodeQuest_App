// ============================================================================
// CODEQUEST - CUSTOM SPLASH SCREEN (MESSENGER LAYOUT STYLE)
// Features:
// 1. Centered rectangular logo box with a diagonal Bhutan flag color split
//    (Top-Left Yellow #FFD166 | Bottom-Right Orange #FF6B35).
// 2. Custom CodeQuest terminal logo badge (`</>`) inside the rectangular box.
// 3. Messenger-style centered layout with bottom branding subtext.
// 4. Smooth fade-in and scale-up entrance animation.
// ============================================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform // <-- FIXED: Added Platform import here
} from 'react-native';

// LinearGradient module for diagonal color transition
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // Animation drivers for smooth appearance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    // 1. Trigger fade and scale animations concurrently
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: true,
      })
    ]).start();

    // 2. Hold for 2.5 seconds before transitioning into the main app
    const timer = setTimeout(() => {
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Outer neutral background */}
      <View style={styles.mainWrapper}>
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* ============================================================== */}
          {/* CENTER FOCAL POINT: RECTANGULAR BHUTAN FLAG DIAGONAL LOGO BOX  */}
          {/* ============================================================== */}
          <View style={styles.centerSection}>
            <View style={styles.logoCardBorder}>
              <LinearGradient
                colors={['#FFD166', '#FF6B35']}
                start={{ x: 0, y: 0 }}   // Top-left origin (Yellow)
                end={{ x: 1, y: 1 }}     // Bottom-right target (Orange)
                style={styles.rectangularLogoBox}
              >
                {/* CodeQuest Terminal Logo Badge */}
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{'</>'}</Text>
                </View>

                {/* Main App Title Inside Box */}
                <Text style={styles.logoTextInside}>CodeQuest</Text>
              </LinearGradient>
            </View>

            <Text style={styles.subtextTagline}>Learn Python Step-by-Step</Text>
          </View>

          {/* ============================================================== */}
          {/* BOTTOM FOOTER BRANDING (Messenger Inspired)                     */}
          {/* ============================================================== */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerSubtext}>POWERED BY</Text>
            <Text style={styles.footerBrandText}>CodeQuest Studio</Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLESHEET (Neubrutalist & Clean Layout)
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Off-white clean backdrop
  },
  mainWrapper: {
    flex: 1,
    width: width,
    height: height,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 65,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Dark outline around the rectangular logo box (Neubrutalism aesthetic)
  logoCardBorder: {
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: '#1F1F1F',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 18,
  },
  // Rectangular box with diagonal split gradient
  rectangularLogoBox: {
    width: 220,
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // Circular badge container for the code bracket logo
  codeBadge: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  codeBadgeText: {
    color: '#FFD166',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logoTextInside: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F1F1F',
    letterSpacing: -0.5,
  },
  subtextTagline: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1F1F',
    opacity: 0.75,
    letterSpacing: 0.2,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  footerSubtext: {
    fontSize: 10,
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  footerBrandText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F1F1F',
  },
});