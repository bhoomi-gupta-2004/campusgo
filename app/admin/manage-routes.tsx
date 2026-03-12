import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/config/firbaseConfig';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors'; // Your optimized theme

export default function ManageRoutes() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [routeName, setRouteName] = useState('');
  const [stops, setStops] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'routes'));
      setRoutes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      Alert.alert("Error", "Could not load transport routes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!routeName || !stops) return Alert.alert('Incomplete Data', 'Please provide a route name and at least one stop.');
    const stopList = stops.split(',').map(s => s.trim());

    try {
      if (editingId) {
        await updateDoc(doc(db, 'routes', editingId), {
          name: routeName,
          stops: stopList
        });
        setEditingId(null);
        Alert.alert("Success", "Route configuration updated.");
      } else {
        await addDoc(collection(db, 'routes'), {
          name: routeName,
          stops: stopList
        });
        Alert.alert("Success", "New route added to the university network.");
      }

      setRouteName('');
      setStops('');
      fetchRoutes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (route: any) => {
    setRouteName(route.name);
    setStops(route.stops.join(', '));
    setEditingId(route.id);
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Archive Route', 'Are you sure? This will remove the route from active selection.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'routes', id));
          fetchRoutes();
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
    <View style={[styles.main, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.heading, { color: theme.text }]}>Route Mapping</Text>

          {/* 1. Configuration Card */}
          <View style={[styles.glassCard, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {editingId ? '✏️ Modify Route' : '➕ Define New Route'}
            </Text>

            <View style={[styles.inputGroup, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
              <MaterialIcons name="alt-route" size={18} color={theme.icon} />
              <TextInput
                placeholder="Route Name (e.g. Campus Express)"
                placeholderTextColor={theme.icon}
                value={routeName}
                onChangeText={setRouteName}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E', height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Ionicons name="location-outline" size={18} color={theme.icon} style={{ marginTop: 2 }} />
              <TextInput
                placeholder="Stops (separate with commas)"
                placeholderTextColor={theme.icon}
                value={stops}
                onChangeText={setStops}
                multiline
                style={[styles.input, { color: theme.text, height: '100%', textAlignVertical: 'top' }]}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddOrUpdate}>
              <Text style={styles.submitBtnText}>{editingId ? 'Update Configuration' : 'Create Route'}</Text>
            </TouchableOpacity>
          </View>

          {/* 2. List Section */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Active University Routes</Text>
          
          {routes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="map" size={40} color={theme.icon} style={{ opacity: 0.3 }} />
              <Text style={[styles.emptyText, { color: theme.icon }]}>No active routes found.</Text>
            </View>
          ) : (
            routes.map(route => (
              <View key={route.id} style={[styles.routeCard, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
                <View style={styles.routeHeader}>
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>NETWORK</Text>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleEdit(route)} style={styles.iconBtn}>
                      <Feather name="edit-3" size={18} color="#20bf6b" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(route.id)} style={styles.iconBtn}>
                      <Feather name="trash-2" size={18} color="#eb3b5a" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.routeTitle, { color: theme.text }]}>{route.name}</Text>
                
                {/* Visual Step Indicator for Stops */}
                <View style={styles.stopsWrapper}>
                  {route.stops.map((stop: string, idx: number) => (
                    <View key={idx} style={styles.stopItem}>
                      <View style={styles.stepperContainer}>
                        <View style={[styles.dot, { backgroundColor: idx === 0 ? '#4a90e2' : '#20bf6b' }]} />
                        {idx !== route.stops.length - 1 && <View style={[styles.line, { backgroundColor: theme.icon + '30' }]} />}
                      </View>
                      <Text style={[styles.stopText, { color: theme.icon }]}>{stop}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500' },
  submitBtn: {
    backgroundColor: '#4a90e2',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, marginLeft: 4 },
  routeCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brandBadge: { backgroundColor: 'rgba(74, 144, 226, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  brandBadgeText: { color: '#4a90e2', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 16 },
  iconBtn: { padding: 4 },
  routeTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  stopsWrapper: { marginLeft: 6 },
  stopItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  stepperContainer: { alignItems: 'center', width: 20, marginRight: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  line: { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  stopText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: '600' },
});