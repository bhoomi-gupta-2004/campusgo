import { Colors } from "@/constants/Colors"; 
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  Feather
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator
} from "react-native";
// Import Firestore tools
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firbaseConfig";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const router = useRouter();

  // State for financials
  const [stats, setStats] = useState({ paidCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const allStudents = snapshot.docs
        .map(doc => doc.data())
        .filter(u => u.role?.toLowerCase() === 'student');

      const paid = allStudents.filter(s => s.feeStatus === 'paid');
      const pending = allStudents.filter(s => s.feeStatus !== 'paid');
      
      setStats({ 
        paidCount: paid.length, 
        pendingCount: pending.length 
      });
    } catch (error) {
      console.error("Financial sync error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!theme) return null;

  const AdminOption = ({ href, icon, label, sublabel, color }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.card,
        { backgroundColor: colorScheme === "light" ? "#fff" : "#1C1C1E" },
      ]}
      onPress={() => router.push(href)}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
        {icon}
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardText, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.cardSubtext, { color: theme.icon }]}>
          {sublabel}
        </Text>
      </View>
      <View
        style={[
          styles.arrowCircle,
          { backgroundColor: colorScheme === "light" ? "#f8f9fa" : "#2C2C2E" },
        ]}
      >
        <Ionicons name="arrow-forward" size={16} color={color} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Elite Header Design */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brandText, { color: "#4a90e2" }]}>
              GNA PORTAL
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>
              Admin Center
            </Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>
              Global fleet control panel
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.settingsBtn,
              { backgroundColor: colorScheme === "light" ? "#fff" : "#1C1C1E" },
            ]}
          >
            <Ionicons name="options-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>


        {/* Simplified Illustration Section */}
        <View style={styles.illustrationWrapper}>
          <View style={[styles.blob, { backgroundColor: "#4a90e220" }]} />
          <Image
            source={require("../../assets/images/admin-dashboard.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Menu Section */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Core Management
        </Text>
        <View style={styles.menuList}>
          <AdminOption
            href="/admin/manage-users"
            label="User Directory"
            sublabel="Manage Students & Faculty"
            color="#2d98da"
            icon={<FontAwesome5 name="users-cog" size={22} color="#2d98da" />}
          />

          <AdminOption
            href="/admin/manage-routes"
            label="Route Mapping"
            sublabel="Optimize Stops & Timing"
            color="#20bf6b"
            icon={
              <MaterialCommunityIcons
                name="map-clock"
                size={26}
                color="#20bf6b"
              />
            }
          />

          <AdminOption
            href="/admin/manage-buses"
            label="Fleet Assets"
            sublabel="Buses & Assigned Drivers"
            color="#fa8231"
            icon={<Ionicons name="bus-sharp" size={26} color="#fa8231" />}
          />
        </View>

        <Text style={[styles.versionText, { color: theme.icon }]}>
          GNA System Core • v1.4.2
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  scrollContainer: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 16, marginTop: 2, fontWeight: "500" },
  settingsBtn: {
    padding: 12,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  // Finance Section Styles
  financeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  statNum: {
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  illustrationWrapper: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    position: "relative",
  },
  blob: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    transform: [{ scaleX: 1.5 }],
  },
  image: { width: width * 0.8, height: 160 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    marginLeft: 4,
  },
  menuList: { gap: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: { elevation: 3 },
    }),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  cardText: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  cardSubtext: { fontSize: 13, marginTop: 2, fontWeight: "500" },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 40,
    opacity: 0.5,
    fontWeight: "700",
  },
});