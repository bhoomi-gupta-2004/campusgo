import { Colors } from "@/constants/Colors"; // Your optimized theme
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4a90e2", // Professional Blue
        tabBarInactiveTintColor: theme.icon, // Dynamic gray
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          // Removed Fonts.sans to prevent the "undefined" error
        },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
          backgroundColor: theme.background, // Matches page background
          borderTopWidth: 1,
          borderTopColor: theme.border || "rgba(128,128,128,0.1)", // Dynamic border
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: theme.background, // Dynamic header
        },
        headerTitleStyle: {
          color: theme.text, // Dynamic text
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-sharp" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="bus-location"
        options={{
          title: "Track",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bus-marker"
              size={size + 4}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size + 4} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="drivers-and-routes"
        options={{
          title: "Directory",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="address-book" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
