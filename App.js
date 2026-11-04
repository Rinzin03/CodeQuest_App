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
// IMPORTING DATABASE SEEDING SCRIPT
// ==========================================
import { seedExpandedCodeQuestDatabase } from './src/services/seedExpandedDatabase';

// ==========================================
// IMPORTING SCREENS (DEFAULT EXPORTS)
// ==========================================
import AuthScreen from './src/screens/AuthScreen';
import HomeDashboardScreen from './src/screens/HomeDashboardScreen';
import QuestMapScreen from './src/screens/QuestMapScreen';
import ChooseChallengeScreen from './src/screens/ChooseChallengeScreen';
import QuizSessionScreen from './src/screens/QuizSessionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Initialize our Stack and Bottom Tab navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// MAIN TABS NAVIGATION (Bottom Bar)
// ==========================================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 2,
          borderTopColor: '#1F1F1F',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ focused, color }) => {
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
export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // 1. Run database seeding script ONCE when the app starts up
  useEffect(() => {
    seedExpandedCodeQuestDatabase();
  }, []);

  // 2. Listen to Firebase authentication state changes in real-time
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  // Prevent rendering until Firebase finishes checking the user session
  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#FFD166' } }}>
        {user ? (
          // IF USER IS LOGGED IN: Show main application screens, challenges & settings
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen 
              name="ChooseChallenge" 
              component={ChooseChallengeScreen} 
              options={{ title: 'Select Mode' }} 
            />
            <Stack.Screen 
              name="QuizSession" 
              component={QuizSessionScreen} 
              options={{ title: 'Quest Challenge' }} 
            />
            {/* ============================================================== */}
            {/* SETTINGS SCREEN REGISTERED AT ROOT STACK LEVEL                */}
            {/* Allows direct navigation from ProfileScreen header gear icon    */}
            {/* ============================================================== */}
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ headerShown: false }} 
            />
          </>
        ) : (
          // IF USER IS NOT LOGGED IN: Show authentication screen (Login / Sign Up)
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}