import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, useColorScheme, Platform, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '@/config/firbaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Colors } from '@/constants/Colors'; // Your optimized theme
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function BusAttendanceScreen() {
  const { busId } = useLocalSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const dateKey = selectedDate.toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'users'));
        const filteredUsers = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((u: any) => (u.role === 'Student' || u.role === 'Teacher') && u.busNumber == busId);

        setUsers(filteredUsers);

        const ref = doc(db, 'attendance', String(busId), 'records', dateKey);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setAttendance(snap.data().records);
        } else {
          const initial: { [key: string]: string } = {};
          filteredUsers.forEach(u => { initial[u.id] = 'absent'; });
          setAttendance(initial);
        }
      } finally {
        setLoading(false);
      }
    };

    if (busId) fetchData();
  }, [busId, dateKey]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'present' ? 'absent' : 'present',
    }));
  };

  const saveAttendance = async () => {
    try {
      const ref = doc(db, 'attendance', String(busId), 'records', dateKey);
      await setDoc(ref, { date: dateKey, records: attendance });
      Alert.alert('Attendance Logged', `Records for Bus ${busId} on ${dateKey} have been synchronized.`);
    } catch (err) {
      Alert.alert('Sync Error', 'Failed to update attendance logs.');
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );

  return (
    <View style={[styles.main, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. Dynamic Header Section */}
        <View style={styles.headerArea}>
          <Text style={[styles.heading, { color: theme.text }]}>Bus {busId} Roll Call</Text>
          <Text style={[styles.subheading, { color: theme.icon }]}>Manage student & faculty boarding</Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: '#4a90e2' }]}>
               <Text style={styles.statVal}>{users.length}</Text>
               <Text style={styles.statLab}>TOTAL</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#20bf6b' }]}>
               <Text style={styles.statVal}>{presentCount}</Text>
               <Text style={styles.statLab}>PRESENT</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#eb3b5a' }]}>
               <Text style={styles.statVal}>{users.length - presentCount}</Text>
               <Text style={styles.statLab}>ABSENT</Text>
            </View>
          </View>
        </View>

        {/* 2. Date Selection Trigger */}
        <TouchableOpacity 
          style={[styles.datePickerButton, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]} 
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={18} color="#4a90e2" />
          <Text style={[styles.dateText, { color: theme.text }]}>Log Date: {dateKey}</Text>
          <Feather name="chevron-down" size={16} color={theme.icon} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}

        {/* 3. Personalized Attendance List */}
        <View style={styles.listSection}>
          {users.map(user => (
            <View key={user.id} style={[styles.userCard, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: attendance[user.id] === 'present' ? '#20bf6b' : '#eb3b5a' }]}>
                  <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                  <View style={styles.roleTag}>
                    <Text style={[styles.userRole, { color: theme.icon }]}>{user.role.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.statusToggle,
                  attendance[user.id] === 'present' ? styles.presentBg : styles.absentBg
                ]}
                onPress={() => toggleAttendance(user.id)}
              >
                <MaterialCommunityIcons 
                  name={attendance[user.id] === 'present' ? "check-circle" : "close-circle"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {attendance[user.id] === 'present' ? 'PRESENT' : 'ABSENT'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 4. Action Bar */}
        <TouchableOpacity style={styles.saveButton} onPress={saveAttendance}>
          <Text style={styles.saveText}>Update Log Database</Text>
          <Ionicons name="cloud-upload" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingTop: 60 },
  headerArea: { marginBottom: 24 },
  heading: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  subheading: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  statBox: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: '900' },
  statLab: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  dateText: { flex: 1, fontSize: 16, fontWeight: '700' },
  listSection: { gap: 14 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 24,
    justifyContent: 'space-between',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  userName: { fontSize: 16, fontWeight: '800' },
  roleTag: { marginTop: 2 },
  userRole: { fontSize: 10, fontWeight: '900', opacity: 0.6, letterSpacing: 0.5 },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  presentBg: { backgroundColor: '#20bf6b' },
  absentBg: { backgroundColor: '#eb3b5a' },
  statusText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  saveButton: {
    backgroundColor: '#4a90e2',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#4a90e2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});