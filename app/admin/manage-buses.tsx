import { db } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';

export default function ManageBuses() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [routeId, setRouteId] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const routeSnapshot = await getDocs(collection(db, 'routes'));
      setRoutes(routeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const driverSnapshot = await getDocs(collection(db, 'drivers'));
      setDrivers(driverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch directory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateDriver = async () => {
    if (!name || !phone || !routeId || !busNumber) {
      Alert.alert('Incomplete Form', 'Please fill all fields to register a driver.');
      return;
    }

    try {
      const driverData = { name, phone, routeId, busNumber };
      if (editingId) {
        await updateDoc(doc(db, 'drivers', editingId), driverData);
        Alert.alert('Updated', 'Personnel record updated successfully.');
      } else {
        await addDoc(collection(db, 'drivers'), driverData);
        Alert.alert('Success', 'New driver registered to the GNA fleet!');
      }

      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save record.');
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setRouteId('');
    setBusNumber('');
    setEditingId(null);
  };

  const handleEdit = (driver: any) => {
    setName(driver.name);
    setPhone(driver.phone);
    setRouteId(driver.routeId);
    setBusNumber(driver.busNumber);
    setEditingId(driver.id);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirm Deletion', 'Remove this driver from the active fleet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'drivers', id));
          setDrivers(drivers.filter(d => d.id !== id));
        }
      }
    ]);
  };

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );

  return (
    <ScrollView 
      style={[styles.main, { backgroundColor: theme.background }]} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: theme.text }]}>Fleet Personnel</Text>
      
      {/* 1. Registration Card */}
      <View style={[styles.glassCard, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {editingId ? '✏️ Edit Profile' : '➕ Register Driver'}
        </Text>

        <View style={[styles.inputGroup, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
          <FontAwesome5 name="id-card" size={16} color={theme.icon} />
          <TextInput
            placeholder="Driver Full Name"
            placeholderTextColor={theme.icon}
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
          <Ionicons name="call-outline" size={18} color={theme.icon} />
          <TextInput
            placeholder="Mobile Number"
            placeholderTextColor={theme.icon}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, { color: theme.text }]}
          />
        </View>

        <View style={[styles.inputGroup, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
          <MaterialCommunityIcons name="bus-side" size={20} color={theme.icon} />
          <TextInput
            placeholder="Assigned Bus Number"
            placeholderTextColor={theme.icon}
            value={busNumber}
            onChangeText={setBusNumber}
            style={[styles.input, { color: theme.text }]}
          />
        </View>
<View
  style={[
    styles.pickerBox,
    {
      backgroundColor:
        colorScheme === 'light' ? '#F9FAFB' : '#2C2C2E',
      borderColor:
        colorScheme === 'light' ? '#D1D5DB' : '#444',
    },
  ]}
>
  <Picker
    selectedValue={routeId}
    onValueChange={(itemValue) => setRouteId(itemValue)}
    style={styles.picker}
    dropdownIconColor={theme.icon}
  >
    {/* Placeholder */}
    <Picker.Item
      label="Select Route Assignment"
      value=""
      color="#888"
    />

    {/* Routes */}
    {routes.map((r) => (
      <Picker.Item
        key={r.id}
        label={r.name || "Unnamed Route"}
        value={r.id}
        color="#000" // Best possible for light mode
      />
    ))}
  </Picker>
</View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleAddOrUpdateDriver}>
          <Text style={styles.submitBtnText}>{editingId ? 'Update Record' : 'Register to Fleet'}</Text>
        </TouchableOpacity>
        
        {editingId && (
          <TouchableOpacity onPress={resetForm} style={styles.cancelBtn}>
            <Text style={[styles.cancelBtnText, { color: theme.icon }]}>Discard Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Driver Directory Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Fleet Directory</Text>
      
      {drivers.map(driver => (
        <View key={driver.id} style={[styles.driverCard, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
          <View style={styles.driverInfo}>
            <View style={[styles.avatarCircle, { backgroundColor: '#4a90e2' }]}>
              <Text style={styles.avatarChar}>{driver.name?.charAt(0)}</Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.nameText, { color: theme.text }]}>{driver.name}</Text>
              <Text style={[styles.subText, { color: theme.icon }]}>📞 {driver.phone}</Text>
              <View style={styles.badgeRow}>
                 <View style={styles.busBadge}>
                    <Text style={styles.badgeText}>BUS {driver.busNumber}</Text>
                 </View>
                 <View style={[styles.busBadge, { backgroundColor: 'rgba(32, 191, 107, 0.1)' }]}>
                    <Text style={[styles.badgeText, { color: '#20bf6b' }]}>ACTIVE</Text>
                 </View>
              </View>
            </View>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(driver)}>
              <Feather name="edit-2" size={18} color="#20bf6b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(driver.id)}>
              <Feather name="trash-2" size={18} color="#eb3b5a" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 28, fontWeight: '900', marginBottom: 24, letterSpacing: -1 },
  glassCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 3 },
    }),
  },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
 pickerBox: {
  borderRadius: 14,
  marginBottom: 16,
  height: 55,
  justifyContent: 'center',
  borderWidth: 1,
  overflow: 'hidden', // fixes Android UI
},

picker: {
  height: 55,
  width: '100%',
},
  submitBtn: {
    backgroundColor: '#4a90e2',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn: { marginTop: 16, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, marginLeft: 4 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 24,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  driverInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarCircle: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarChar: { color: '#fff', fontSize: 22, fontWeight: '900' },
  details: { marginLeft: 16, flex: 1 },
  nameText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  subText: { fontSize: 14, marginTop: 2, fontWeight: '500' },
  badgeRow: { marginTop: 8, flexDirection: 'row', gap: 8 },
  busBadge: { backgroundColor: 'rgba(74, 144, 226, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#4a90e2', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  actions: { gap: 18, marginLeft: 10 },
  actionBtn: { padding: 4 },
});