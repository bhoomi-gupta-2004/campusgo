import { db } from "@/config/firbaseConfig";
import { Colors } from "@/constants/Colors";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { getCurrentMonthKey, getPaymentDocId } from "@/utils/paymentHelpers";
export default function Profile() {
  const [userData, setUserData] = useState<any>(null);

  const [paid, setPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  useEffect(() => {
    const fetchUserDataAndPayment = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      try {
        // 1️⃣ get user
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        setUserData(data);

        // 2️⃣ ONLY students have payments
        if (data.role?.toLowerCase() === "student") {
          const id = getPaymentDocId(user.uid);
          const snap = await getDoc(doc(db, "busPayments", id));
          setPaid(snap.exists());
        }
      } catch (err) {
        console.log("Error fetching profile/payment:", err);
      } finally {
        setLoading(false);
        setCheckingPayment(false);
      }
    };

    fetchUserDataAndPayment();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const payFees = async () => {
    const user = getAuth().currentUser;
    if (!user || userData?.role?.toLowerCase() !== "student") {
      Alert.alert("Not Allowed", "Only students can pay fees");
      return;
    }

    Alert.alert("Demo Payment", "Simulate ₹1200 bus fee payment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Pay",
        onPress: async () => {
          const id = getPaymentDocId(user.uid);

          await setDoc(doc(db, "busPayments", id), {
            uid: user.uid,
            name: userData?.name || "Student",
            busNumber: userData?.busNumber || "N/A",
            month: getCurrentMonthKey(),
            amount: 1200,
            status: "paid",
            method: "demo",
            paidAt: serverTimestamp(),
          });

          setPaid(true);
          Alert.alert("Payment Successful", "Receipt generated (Demo)");
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  const isStudent = userData?.role?.toLowerCase?.() === "student";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. IDENTITY CARD (The Hero) */}
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

      {/* 2. LOGISTICS SECTION */}
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

      {/* Payment Section — Only for Students */}
      {isStudent && (
        <View style={{ marginTop: 25 }}>
          {checkingPayment ? (
            <ActivityIndicator color="#4a90e2" />
          ) : paid ? (
            <View
              style={{
                backgroundColor: "#20bf6b22",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#20bf6b", fontWeight: "800", fontSize: 16 }}
              >
                Fees Paid for this month ✅
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={payFees}
              style={{
                backgroundColor: "#4a90e2",
                padding: 18,
                borderRadius: 18,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                Pay Bus Fees ₹1200
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* 3. LOGOUT (Minimalist style) */}
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
  // IDENTITY CARD STYLES
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
  idBrand: { fontSize: 14, fontWeight: "800", letterSpacing: 1 },
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
  idName: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  idSub: { fontSize: 13, marginTop: 2 },
  idFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(128,128,128,0.1)",
    paddingTop: 20,
  },
  idLabel: { fontSize: 9, fontWeight: "800", color: "#888", letterSpacing: 1 },
  idValue: { fontSize: 14, fontWeight: "700", color: "#4a90e2", marginTop: 2 },

  // LOGISTICS SECTION
  sectionHeader: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    marginLeft: 8,
  },
  logisticsCard: {
    borderRadius: 24,
    padding: 12,
  },
  detailRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(128,128,128,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  detailValue: { fontSize: 16, fontWeight: "700", marginTop: 1 },
  line: {
    height: 1,
    backgroundColor: "rgba(128,128,128,0.05)",
    marginHorizontal: 20,
  },

  signoutWrap: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(235, 59, 90, 0.2)",
  },
  signoutText: { color: "#EB3B5A", fontWeight: "800", fontSize: 16 },
  bottomNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#888",
    marginTop: 40,
    marginBottom: 20,
  },
});
