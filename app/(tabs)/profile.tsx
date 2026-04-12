import { db } from '@/config/firebaseConfig';
import { Colors } from "@/constants/Colors";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists()) return;

        setUserData(docSnap.data());
      } catch (err) {
        console.log("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading)
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.identityCard,
          { backgroundColor: colorScheme === "light" ? "#fff" : "#1C1C1E" },
        ]}
      >
        <View style={styles.idHeader}>
          <Text style={[styles.idBrand, { color: "#4a90e2" }]}>
            BusTracker <Text style={{ fontWeight: "300" }}>Pro</Text>
          </Text>
          <MaterialCommunityIcons
            name="nfc"
            size={24}
            color="#4a90e2"
            style={{ opacity: 0.5 }}
          />
        </View>

        <View style={styles.idMain}>
          <View style={styles.avatarBorder}>
            {userData?.profilePic ? (
              <Image
                source={{ uri: userData.profilePic }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Text style={styles.avatarInitial}>
                  {userData?.name?.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.idTextContent}>
            <Text style={[styles.idName, { color: theme.text }]}>
              {userData?.name}
            </Text>
            <Text style={[styles.idSub, { color: theme.icon }]}>
              {userData?.email}
            </Text>
          </View>
        </View>

        <View style={styles.idFooter}>
          <View>
            <Text style={styles.idLabel}>STATUS</Text>
            <Text style={styles.idValue}>VERIFIED</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.idLabel}>ID NUMBER</Text>
            <Text style={styles.idValue}>
              #{userData?.uid?.substring(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: theme.text }]}>
        Service Details
      </Text>

      <View
        style={[
          styles.logisticsCard,
          { backgroundColor: colorScheme === "light" ? "#fff" : "#1C1C1E" },
        ]}
      >
        <DetailRow
          icon={<FontAwesome5 name="user-shield" size={18} color="#4a90e2" />}
          label="Access Level"
          value={userData?.role}
          theme={theme}
        />
        <View style={styles.line} />
        <DetailRow
          icon={<Ionicons name="bus-sharp" size={20} color="#059669" />}
          label="Route assigned"
          value={userData?.busNumber || "UNASSIGNED"}
          theme={theme}
        />
      </View>

      <TouchableOpacity style={styles.signoutWrap} onPress={handleLogout}>
        <Text style={styles.signoutText}>Log Out</Text>
        <Ionicons name="power" size={18} color="#EB3B5A" />
      </TouchableOpacity>

      <Text style={styles.bottomNote}>
        GNA University Bus Management System
      </Text>
    </ScrollView>
  );
}

const DetailRow = ({ icon, label, value, theme }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.iconCircle}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.detailLabel, { color: theme.icon }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 24, paddingTop: 60 },
  identityCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  idHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  idBrand: { fontSize: 14, fontWeight: "800" },
  idMain: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  avatarBorder: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#4a90e2",
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  placeholderAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  idTextContent: { marginLeft: 16 },
  idName: { fontSize: 24, fontWeight: "900" },
  idSub: { fontSize: 13 },
  idFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
  },
  idLabel: { fontSize: 9, fontWeight: "800", color: "#888" },
  idValue: { fontSize: 14, fontWeight: "700", color: "#4a90e2" },
  sectionHeader: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  logisticsCard: { borderRadius: 24, padding: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: { fontSize: 11 },
  detailValue: { fontSize: 16, fontWeight: "700" },
  line: { height: 1, marginHorizontal: 20 },
  signoutWrap: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
  },
  signoutText: { color: "#EB3B5A", fontWeight: "800" },
  bottomNote: { textAlign: "center", marginTop: 40 },
});