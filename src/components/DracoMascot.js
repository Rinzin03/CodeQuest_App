// ==========================================
// FREESTANDING EXPRESSIVE DRACO MASCOT
// ==========================================
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { playSound } from '../services/audioService';

export default function DracoMascot({ message, mood = 'idle', onTap }) {
  // --- ANIMATION TRACKERS ---
  const translateY = useRef(new Animated.Value(0)).current; // Vertical movement
  const translateX = useRef(new Animated.Value(0)).current; // Horizontal movement

  const handleDracoTap = () => {
  // Play click sound on tap
  playSound('click');

  setDracoMood('success');
  setTimeout(() => {
    setDracoMood('idle');
  }, 1200);
};

  // --- REACTIVE EXPRESSION & ANIMATION LOGIC ---
  useEffect(() => {
    if (mood === 'success') {
      // SUCCESS MOOD: Happy double victory hop!
      Animated.sequence([
        Animated.timing(translateY, { toValue: -24, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -14, duration: 140, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start();
    } else if (mood === 'sad') {
      // SAD MOOD: Crying / Heart loss drooping & shivering
      Animated.sequence([
        Animated.timing(translateY, { toValue: 12, duration: 250, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -5, duration: 90, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 5, duration: 90, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -3, duration: 90, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 90, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } else if (mood === 'warning') {
      // WARNING MOOD: Locked topic head shake
      Animated.sequence([
        Animated.timing(translateX, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 8, duration: 80, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    } else {
      // IDLE MOOD: Continuous breathing float
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -8, duration: 1000, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [mood, translateY, translateX]);

  // Determine hint label and emoji by mood
  let hintText = 'Draco says: 🐲';
  let hintColor = '#FF6B35';

  if (mood === 'success') {
    hintText = '🎉 Level Cleared! Happy Dragon!';
    hintColor = '#2D6A4F';
  } else if (mood === 'sad') {
    hintText = '💔 Ouch! Lost a Heart!';
    hintColor = '#E63946';
  } else if (mood === 'warning') {
    hintText = '⚠️ Topic Locked!';
    hintColor = '#D4A373';
  }

  return (
    <View style={styles.wrapper}>
      
      {/* ======================================================== */}
      {/* 1. BIG DRACO CHARACTER (POSITIONED ON THE LEFT)          */}
      {/* ======================================================== */}
      <Animated.View 
        style={[
          styles.bigCharacterWrapper, 
          { transform: [{ translateY }, { translateX }] }
        ]}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onTap}>
          <Image 
            source={require('../../assets/draco.png')} 
            style={styles.bigDracoImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* ======================================================== */}
      {/* 2. COMPACT SPEECH BUBBLE BOX (SITS BESIDE DRACO)          */}
      {/* ======================================================== */}
      <TouchableOpacity activeOpacity={0.9} onPress={onTap} style={styles.speechBubbleCard}>
        <View style={styles.speechTextContent}>
          <Text style={[styles.speechBubbleHint, { color: hintColor }]}>
            {hintText}
          </Text>
          <Text style={styles.speechText}>{message}</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}

// ==========================================
// STYLING SHEET
// ==========================================
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
    marginTop: 25,
    position: 'relative',
    justifyContent: 'center',
  },

  // Big Freestanding Draco on the left edge
  bigCharacterWrapper: { 
    position: 'absolute',
    left: 0,
    top: -25,
    zIndex: 10, // Keeps Draco rendered cleanly on top
  },
  
  bigDracoImage: { 
    width: 95, 
    height: 95 
  },

  // Compact Speech Bubble Box shifted right so Draco never covers it
  speechBubbleCard: { 
    backgroundColor: '#FFF', 
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 78, // Pushes speech box clear of Draco's body
    borderRadius: 18, 
    borderWidth: 2.5, 
    borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    minHeight: 65,
    justifyContent: 'center'
  },
  
  speechTextContent: { flex: 1 },
  
  speechBubbleHint: { 
    fontSize: 9, 
    fontWeight: '900', 
    marginBottom: 2, 
    textTransform: 'uppercase' 
  },
  
  speechText: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#1F1F1F', 
    lineHeight: 16 
  }
});