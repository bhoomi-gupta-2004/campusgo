import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  useColorScheme, 
  ActivityIndicator,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/config/firbaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Colors } from '@/constants/Colors'; // Your optimized theme
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function AttendanceIndex() {
  const [busNumbers, setBusNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    const fetchBusNumbers = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'users'));
        const students = snapshot.docs
          .map(doc => doc.data())
          .filter(user => user.role === 'Student' || user.role === 'Teacher');

        const uniqueBusNumbers = [
          ...new Set(students.map(student => student.busNumber).filter(Boolean)),
        ];

        // Ensure numbers are sorted for a cleaner directory look
        setBusNumbers(uniqueBusNumbers.sort((a, b) => a - b));
      } catch (error) {
        console.error("Error fetching fleet numbers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusNumbers();
  }, []);

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );

  return (
    <View style={[styles.main, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerArea}>
          <Text style={[styles.title, { color: theme.text }]}>Fleet Attendance</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Select an active bus to log or view roll call
          </Text>
        </View>

        {/* Bus List Grid */}
        <View style={styles.list}>
          {busNumbers.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="bus" size={40} color={theme.icon} style={{ opacity: 0.2 }} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No active buses registered.</Text>
            </View>
          ) : (
            busNumbers.map((busNum, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                style={[styles.busCard, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}
                onPress={() => router.push({ pathname: '/attendance/[busId]', params: { busId: busNum } })}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, { backgroundColor: '#4a90e215' }]}>
                    <FontAwesome5 name="bus" size={20} color="#4a90e2" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.busTitle, { color: theme.text }]}>Bus {busNum}</Text>
                    <Text style={[styles.busSub, { color: theme.icon }]}>University Network</Text>
                  </View>
                  <Ionicons name="chevron-forward-circle" size={24} color="#4a90e2" style={styles.chevron} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.footerNote}>GNA University Transport Portal • 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingTop: 60 },
  headerArea: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 4, opacity: 0.8 },
  list: { gap: 14 },
  busCard: {
    borderRadius: 24,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardInfo: { flex: 1 },
  busTitle: { fontSize: 18, fontWeight: '800' },
  busSub: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  chevron: { opacity: 0.8 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: '700' },
  footerNote: { textAlign: 'center', fontSize: 11, color: '#888', marginTop: 40, marginBottom: 20, fontWeight: '600' }
});