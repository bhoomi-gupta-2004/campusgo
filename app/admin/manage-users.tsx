import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
} from 'react-native';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { db, firebaseConfig } from "@/config/firbaseConfig";
import { FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';

export default function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [busNumber, setBusNumber] = useState('');
  const [role, setRole] = useState('Student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert("Sync Error", "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserWithAuth = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Info", "All fields are required.");
      return;
    }
    setSubmitting(true);

    // FIX: Check if Secondary App exists to prevent re-initialization error
    let secondaryApp;
    if (getApps().some(app => app.name === "Secondary")) {
      secondaryApp = getApp("Secondary");
    } else {
      secondaryApp = initializeApp(firebaseConfig, "Secondary");
    }
    
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = userCredential.user.uid;
      const userData = {
        uid,
        name,
        email,
        busNumber,
        role,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', uid), userData);
      setUsers([...users, { id: uid, ...userData }]);
      Alert.alert("Provisioned", `${name} added to portal.`);
      closeModal();
      await signOut(secondaryAuth);
    } catch (error: any) {
      Alert.alert("Provisioning Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const updatedData = { busNumber, role };
      await updateDoc(userRef, updatedData);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updatedData } : u));
      Alert.alert("Success", "Record updated.");
      closeModal();
    } catch (error) {
      Alert.alert("Error", "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove User", "Revoke system access for this individual?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
          await deleteDoc(doc(db, 'users', id));
          setUsers(users.filter(user => user.id !== id));
      }}
    ]);
  };

  const openModal = (user: any = null) => {
    setSelectedUser(user);
    if (user) {
      setBusNumber(user.busNumber || '');
      setRole(user.role || 'Student');
      setName(user.name || '');
      setEmail(user.email || '');
    } else {
      setBusNumber('');
      setRole('Student');
      setName('');
      setEmail('');
      setPassword('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const getRoleColor = (roleStr: string) => {
    switch (roleStr?.toLowerCase()) {
      case 'admin': return '#eb3b5a';
      case 'teacher': return '#fa8231';
      default: return '#4a90e2';
    }
  };

  if (loading) return (
    <View style={[styles.center, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color="#4a90e2" />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Directory</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>{users.length} active members</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) }]}>
                <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.email, { color: theme.icon }]}>{item.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '15' }]}>
                 <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
              </View>
            </View>
            
            <View style={styles.cardFooter}>
              <View style={styles.busInfo}>
                <FontAwesome5 name="bus" size={12} color={theme.icon} />
                <Text style={[styles.busText, { color: theme.icon }]}>Route: {item.busNumber || 'None'}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
                  <Feather name="edit-2" size={18} color="#4a90e2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                  <Feather name="trash-2" size={18} color="#eb3b5a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedUser ? 'Edit User' : 'Add User'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={28} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!selectedUser && (
                <>
                  <Text style={styles.label}>FULL NAME</Text>
                  <TextInput placeholder="Enter name" placeholderTextColor={theme.icon} value={name} onChangeText={setName} style={[styles.input, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E', color: theme.text }]} />
                  <Text style={styles.label}>EMAIL</Text>
                  <TextInput placeholder="university-id@gna.edu" placeholderTextColor={theme.icon} value={email} onChangeText={setEmail} style={[styles.input, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E', color: theme.text }]} autoCapitalize="none" />
                  <Text style={styles.label}>PASSWORD</Text>
                  <TextInput placeholder="Minimum 6 chars" placeholderTextColor={theme.icon} value={password} onChangeText={setPassword} style={[styles.input, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E', color: theme.text }]} secureTextEntry />
                </>
              )}

              <Text style={styles.label}>BUS NUMBER</Text>
              <TextInput placeholder="e.g. B-05" placeholderTextColor={theme.icon} value={busNumber} onChangeText={setBusNumber} style={[styles.input, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E', color: theme.text }]} />

              <Text style={styles.label}>SYSTEM ROLE</Text>
              <View style={[styles.pickerBox, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
                <Picker selectedValue={role} onValueChange={setRole} style={{ color: theme.text }}>
                  <Picker.Item label="Student" value="Student" />
                  <Picker.Item label="Teacher" value="Teacher" />
                  <Picker.Item label="Admin" value="Admin" />
                </Picker>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={selectedUser ? handleUpdate : handleCreateUserWithAuth} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{selectedUser ? 'Update Member' : 'Provision Account'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  subtitle: { fontSize: 15, fontWeight: '600', opacity: 0.6 },
  fab: { backgroundColor: '#4a90e2', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  card: { borderRadius: 28, padding: 20, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  info: { marginLeft: 16, flex: 1 },
  name: { fontSize: 18, fontWeight: '800' },
  email: { fontSize: 13, marginTop: 2, opacity: 0.7 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  roleText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.1)', paddingTop: 15 },
  busInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  busText: { fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 28, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  label: { fontSize: 10, fontWeight: '900', color: '#4a90e2', marginBottom: 8, letterSpacing: 1.2 },
  input: { borderRadius: 16, padding: 18, marginBottom: 18, fontSize: 16, fontWeight: '600' },
  pickerBox: { borderRadius: 16, marginBottom: 25, overflow: 'hidden' },
  saveBtn: { backgroundColor: '#4a90e2', padding: 20, borderRadius: 18, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});