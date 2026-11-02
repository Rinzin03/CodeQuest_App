// ==========================================
// IMPORTING CORE REACT & NAVIGATION MODULES
// ==========================================
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebase';

// ==========================================
// IMPORTING SCREENS (NOTE: NO CURLY BRACES {} 
// BECAUSE THEY ARE ALL DEFAULT EXPORTS!)
// ==========================================
import AuthScreen from './src/screens/AuthScreen';
import HomeDashboardScreen from './src/screens/HomeDashboardScreen';
import QuestMapScreen from './src/screens/QuestMapScreen';
import ChooseChallengeScreen from './src/screens/ChooseChallengeScreen';
import QuizSessionScreen from './src/screens/QuizSessionScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Initialize our Stack and Bottom Tab navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// MAIN TABS NAVIGATION (Bottom Bar)
// ==========================================
// This controls the tab bar at the bottom of the screen 
// allowing users to switch between Home, Quest Map, and Profile.
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide header on tabs since screens have custom layouts
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 2,
          borderTopColor: '#1F1F1F',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF6B35', // Active tab icon color (Orange)
        tabBarInactiveTintColor: '#888',   // Inactive tab icon color (Gray)
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        // Dynamically assign vector icons based on the active tab route name
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'QuestMap') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboardScreen} />
      <Tab.Screen name="QuestMap" component={QuestMapScreen} options={{ title: 'Quest Map' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ==========================================
// ROOT APP COMPONENT
// ==========================================
// The top-level wrapper that listens to Firebase authentication state 
// and switches between the Login/Signup flow and the Main App.
export default function App() {
  const [user, setUser] = useState(null);       // Tracks logged-in user state
  const [initializing, setInitializing] = useState(true); // Loading check during startup

  // Listen to Firebase authentication state changes in real-time
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser); // If user is logged in, store user object; otherwise null
      if (initializing) setInitializing(false); // Stop loading once checked
    });
    return subscriber; // Clean up subscription on unmount
  }, []);

  // Prevent rendering until Firebase finishes checking the user session
  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FFD166' } }}>
        {user ? (
          // IF USER IS LOGGED IN: Show main application screens & challenges
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ChooseChallenge" component={ChooseChallengeScreen} options={{ title: 'Select Mode' }} />
            <Stack.Screen name="QuizSession" component={QuizSessionScreen} options={{ title: 'Quest Challenge' }} />
          </>
        ) : (
          // IF USER IS NOT LOGGED IN: Show authentication screen (Login / Sign Up)
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}