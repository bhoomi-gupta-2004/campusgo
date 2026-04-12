import { db } from "@/config/firebaseConfig";
import { Colors } from "@/constants/Colors";
import {
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import {
  collection,
  onSnapshot
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

function Home() {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalDrivers: 0,
    totalStudentsToday: 0,
    totalTeachers: 0,
  });

  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  useEffect(() => {
    const unsubBuses = onSnapshot(collection(db, "drivers"), (s) =>
      setStats((p) => ({ ...p, totalBuses: s.size })),
    );

    const unsubDrivers = onSnapshot(collection(db, "drivers"), (s) =>
      setStats((p) => ({ ...p, totalDrivers: s.size })),
    );

    const unsubUsers = onSnapshot(collection(db, "users"), (s) => {
      const students = s.docs.filter(
        (d) => d.data().role?.toLowerCase()?.trim() === "student"
      ).length;

      const teachers = s.docs.filter(
        (d) => d.data().role?.toLowerCase()?.trim() === "teacher"
      ).length;

      setStats((p) => ({
        ...p,
        totalStudentsToday: students,
        totalTeachers: teachers,
      }));

      setLoading(false);
    });

    return () => {
      unsubBuses();
      unsubDrivers();
      unsubUsers();
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.main, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, { backgroundColor: "#4a90e2" }]}>
  <View style={styles.heroContent}>
    
    <View style={{ flex: 1, paddingRight: 10 }}>
      <Text style={styles.heroLabel}>Welcome</Text>

      <Text style={styles.gnaTitle} numberOfLines={1}>
        GNA University
      </Text>

      <Text style={styles.heroSubtext}>
        Transport Management System
      </Text>
    </View>

    <View style={styles.heroIconCircle}>
      <Text style={styles.universityText}>GNA</Text>
      <Text style={styles.universitySub}>University</Text>
    </View>

  </View>
</View>
      <View style={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Insights
        </Text>

        <View style={styles.gridContainer}>
          <View style={styles.column}>
            <InsightCard
              label="Buses"
              value={stats.totalBuses}
              color="#2563eb"
              icon={<FontAwesome5 name="bus" size={20} color="#fff" />}
              theme={theme}
              dark={colorScheme === "dark"}
            />
            <InsightCard
              label="Staff"
              value={stats.totalTeachers}
              color="#db2777"
              icon={<Feather name="user-check" size={20} color="#fff" />}
              theme={theme}
              dark={colorScheme === "dark"}
            />
          </View>

          <View style={[styles.column, { paddingTop: 20 }]}>
            <InsightCard
              label="Drivers"
              value={stats.totalDrivers}
              color="#7c3aed"
              icon={
                <MaterialCommunityIcons
                  name="account-tie"
                  size={24}
                  color="#fff"
                />
              }
              theme={theme}
              dark={colorScheme === "dark"}
            />
            <InsightCard
              label="Students"
              value={stats.totalStudentsToday}
              color="#059669"
              icon={<Entypo name="graduation-cap" size={20} color="#fff" />}
              theme={theme}
              dark={colorScheme === "dark"}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.refreshBanner,
            { backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff" },
          ]}
        >
          <Ionicons name="refresh-circle" size={24} color="#4a90e2" />
          <Text style={[styles.refreshText, { color: theme.text }]}>
            System is synced in real-time
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const InsightCard = ({ label, value, color, icon, theme, dark }: any) => (
  <View
    style={[styles.insightCard, { backgroundColor: dark ? "#1C1C1E" : "#fff" }]}
  >
    <View style={[styles.insightIcon, { backgroundColor: color }]}>{icon}</View>
    <Text style={[styles.insightValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.insightLabel, { color: theme.icon }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  main: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  heroCard: {
    margin: 20,
    marginTop: 60,
    borderRadius: 30,
    padding: 24,
    elevation: 10,
  },

  gnaTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },

heroContent: {
  flexDirection: "row",
  alignItems: "center",
},

  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    fontWeight: "600",
  },

  heroSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
heroIconCircle: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "rgba(255,255,255,0.2)",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 10,
},

  universityText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },

  universitySub: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.8,
  },

  contentContainer: { paddingHorizontal: 20 },

  sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 15 },

  gridContainer: { flexDirection: "row", gap: 15 },

  column: { flex: 1, gap: 15 },

  insightCard: {
    padding: 18,
    borderRadius: 24,
    alignItems: "center",
    elevation: 2,
  },

  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  insightValue: { fontSize: 22, fontWeight: "bold" },

  insightLabel: { fontSize: 13, fontWeight: "500" },

  refreshBanner: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 40,
  },

  refreshText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Home;