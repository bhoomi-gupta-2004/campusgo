import { db } from "@/config/firebaseConfig";
import { Colors } from "@/constants/Colors";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRootNavigationState, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const fetchUser = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setLoading(false);

          setTimeout(() => {
            router.replace("/auth/login");
          }, 0);

          return;
        }

        const docRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(docRef);
        const userData = userSnap.data();

        if (userData) {
          setUser({ ...userData, uid: currentUser.uid });
        } else {
          console.log("User data not found");
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [rootNavigationState]);

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  const ActionTile = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.tile,
        { backgroundColor: colorScheme === "light" ? "#fff" : "#1C1C1E" },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
        {icon}
      </View>
      <Text style={[styles.tileLabel, { color: theme.text }]}>{label}</Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.icon}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );

  const renderAdminOptions = () => (
    <View style={styles.grid}>
      <ActionTile
        icon={<FontAwesome5 name="route" size={20} color="#2d98da" />}
        label="User and Routes Management"
        color="#2d98da"
        onPress={() => router.push("/admin")}
      />
      <ActionTile
        icon={
          <MaterialCommunityIcons
            name="clipboard-check"
            size={24}
            color="#20bf6b"
          />
        }
        label="Attendance Logs"
        color="#20bf6b"
        onPress={() => router.push("/attendance")}
      />
      <ActionTile
        icon={<Ionicons name="card" size={22} color="#fa8231" />}
        label="Fee Management"
        color="#fa8231"
        onPress={() => router.push("./bus-fee")}
      />
    </View>
  );

  const renderUserOptions = () => (
    <View style={styles.grid}>
    <ActionTile
  icon={
    <MaterialCommunityIcons
      name="calendar-check"
      size={24}
      color="#20bf6b"
    />
  }
  label={
    user?.role?.toLowerCase()?.trim() === "admin"
      ? "Mark Attendance"
      : "View Attendance"
  }
  color="#20bf6b"
  onPress={() => router.push("/attendance")}
/>
      <ActionTile
        icon={<Ionicons name="bus-sharp" size={22} color="#4a90e2" />}
        label="Track My Bus"
        color="#4a90e2"
        onPress={() => router.push("/bus-location")}
      />
      <ActionTile
        icon={<Ionicons name="wallet" size={22} color="#fa8231" />}
        label="Pay Bus Fee"
        color="#fa8231"
        onPress={() => router.push("./bus-fee")}
      />
      <ActionTile
        icon={<Ionicons name="person-circle" size={24} color="#8854d0" />}
        label="My Profile"
        color="#8854d0"
        onPress={() => router.push("/profile")}
      />
    </View>
  );

  return (
    <ScrollView
      style={[styles.main, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hello, {user?.name?.split(" ")[0] || "User"} 👋
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role?.toUpperCase() || "STUDENT"}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push("/profile")}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.name?.charAt(0)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Quick Services
      </Text>

      {user?.role === "admin"
        ? renderAdminOptions()
        : renderUserOptions()}

      {/* Support */}
      <View style={styles.supportCard}>
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportSub}>
            Contact GNA University Transport Cell for assistance.
          </Text>
        </View>
        <Feather name="phone-call" size={28} color="rgba(255,255,255,0.5)" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 24, paddingTop: 60 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },

  greeting: { fontSize: 26, fontWeight: "900" },

  roleBadge: {
    backgroundColor: "rgba(74,144,226,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },

  roleText: {
    color: "#4a90e2",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitial: { color: "#fff", fontWeight: "bold", fontSize: 20 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
  },

  grid: { gap: 16 },

  tile: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  tileLabel: { flex: 1, fontSize: 17, fontWeight: "700" },

  arrow: { opacity: 0.5 },

  supportCard: {
    marginTop: 32,
    padding: 24,
    borderRadius: 28,
    backgroundColor: "#4a90e2",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  supportContent: { flex: 1 },

  supportTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },

  supportSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },
});