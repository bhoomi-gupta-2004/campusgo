import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, ActivityIndicator, 
  useColorScheme, Platform, Dimensions, TouchableOpacity 
} from 'react-native';
import { collection, doc, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { FontAwesome5, MaterialCommunityIcons, Entypo, Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';


const { width } = Dimensions.get('window');

function Home() {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalDrivers: 0,
    totalStudentsToday: 0,
    totalTeachers: 0,
    attendancePercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    
    const unsubBuses = onSnapshot(collection(db, 'drivers'), s => setStats(p => ({ ...p, totalBuses: s.size })));
    const unsubDrivers = onSnapshot(collection(db, 'drivers'), s => setStats(p => ({ ...p, totalDrivers: s.size })));
    const unsubUsers = onSnapshot(collection(db, 'users'), s => {
      const students = s.docs.filter(d => d.data().role === 'Student').length;
      const teachers = s.docs.filter(d => d.data().role === 'Teacher').length;
      setStats(p => ({ ...p, totalStudentsToday: students, totalTeachers: teachers }));
    });

    const fetchAttendance = async () => {
     const unsubAttendance = onSnapshot(collection(db, 'attendance'), async (snap) => {
  const todayKey = new Date().toISOString().split('T')[0];

  let total = 0;
  let present = 0;

  for (const bus of snap.docs) {
    const recRef = doc(db, 'attendance', bus.id, 'records', todayKey);
    const recSnap = await getDoc(recRef);

    if (recSnap.exists()) {
      const r = recSnap.data().records;
      total += Object.keys(r).length;
      present += Object.values(r).filter(s => s === 'present').length;
    }
  }

  setStats(p => ({
    ...p,
    attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
  }));

  setLoading(false);
});
    };
    fetchAttendance();
    return () => { unsubBuses(); unsubDrivers(); unsubUsers(); };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.main, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
     
<View
        style={[styles.heroCard, { backgroundColor: '#4a90e2' }]} 
      >
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroLabel}>Live Attendance</Text>
            <Text style={styles.heroValue}>{stats.attendancePercentage}%</Text>
            <Text style={styles.heroSubtext}>Fleet capacity utilized today</Text>
          </View>
          <View style={styles.heroIconCircle}>
            <MaterialCommunityIcons name="chart-donut" size={50} color="#fff" />
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${stats.attendancePercentage}%` }]} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Insights</Text>
        
        
        <View style={styles.gridContainer}>
          <View style={styles.column}>
            <InsightCard 
              label="Buses" value={stats.totalBuses} color="#2563eb" 
              icon={<FontAwesome5 name="bus" size={20} color="#fff" />} 
              theme={theme} dark={colorScheme === 'dark'}
            />
            <InsightCard 
              label="Staff" value={stats.totalTeachers} color="#db2777" 
              icon={<Feather name="user-check" size={20} color="#fff" />} 
              theme={theme} dark={colorScheme === 'dark'}
            />
          </View>
          <View style={[styles.column, { paddingTop: 20 }]}>
            <InsightCard 
              label="Drivers" value={stats.totalDrivers} color="#7c3aed" 
              icon={<MaterialCommunityIcons name="account-tie" size={24} color="#fff" />} 
              theme={theme} dark={colorScheme === 'dark'}
            />
            <InsightCard 
              label="Students" value={stats.totalStudentsToday} color="#059669" 
              icon={<Entypo name="graduation-cap" size={20} color="#fff" />} 
              theme={theme} dark={colorScheme === 'dark'}
            />
          </View>
        </View>

       
        <TouchableOpacity style={[styles.refreshBanner, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#fff' }]}>
          <Ionicons name="refresh-circle" size={24} color="#4a90e2" />
          <Text style={[styles.refreshText, { color: theme.text }]}>System is synced in real-time</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.icon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const InsightCard = ({ label, value, color, icon, theme, dark }: any) => (
  <View style={[styles.insightCard, { backgroundColor: dark ? '#1C1C1E' : '#fff' }]}>
    <View style={[styles.insightIcon, { backgroundColor: color }]}>
      {icon}
    </View>
    <Text style={[styles.insightValue, { color: theme.text }]}>{value}</Text>
    <Text style={[styles.insightLabel, { color: theme.icon }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  main: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard: {
    margin: 20,
    marginTop: 60,
    borderRadius: 30,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#4a90e2', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 48, fontWeight: '900' },
  heroSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  heroIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  contentContainer: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15 },
  gridContainer: { flexDirection: 'row', gap: 15 },
  column: { flex: 1, gap: 15 },
  insightCard: {
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  insightIcon: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  insightValue: { fontSize: 22, fontWeight: 'bold' },
  insightLabel: { fontSize: 13, fontWeight: '500' },
  refreshBanner: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 40
  },
  refreshText: { flex: 1, marginLeft: 12, fontWeight: '600', fontSize: 14 },
});

export default Home;