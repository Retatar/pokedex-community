import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/config';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        }
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pokemon/index"
        options={{
          title: 'Pokémon',
          tabBarIcon: ({ color }) => <Ionicons name="apps" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="teams/index"
        options={{
          title: 'Teams',
          tabBarIcon: ({ color }) => <Ionicons name="shield" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="pokemon/[id]" options={{ href: null }} />
      <Tabs.Screen name="pokemon/create-review" options={{ href: null }} />
      <Tabs.Screen name="pokemon/edit-review" options={{ href: null }} />
      <Tabs.Screen name="pokemon/filter" options={{ href: null }} />
      <Tabs.Screen name="pokemon/search" options={{ href: null }} />
      <Tabs.Screen name="pokemon/select-team" options={{ href: null }} />
      <Tabs.Screen name="pokemon/compare" options={{ href: null }} />
      <Tabs.Screen name="teams/[id]" options={{ href: null }} />
      <Tabs.Screen name="teams/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="teams/create" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
    </Tabs>
  );
}
