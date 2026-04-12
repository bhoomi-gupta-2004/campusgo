import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  useColorScheme,
  Platform,
  TouchableOpacity,
  Linking
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors'; // Your optimized theme

interface Driver {
  id: string;
  name: string;
  phone: string;
  routeId: string;
}

interface Route {
  id: string;
  name: string;
  stops: string[];
}

function DriversAndRoutesScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Record<string, Route>>({});
  const [loading, setLoading] = useState(true);
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    const fetchDriversAndRoutes = async () => {
      try {
        const driverSnapshot = await getDocs(collection(db, 'drivers'));
        const driverList: Driver[] = [];

        driverSnapshot.forEach((doc) => {
          driverList.push({ id: doc.id, ...doc.data() } as Driver);
        });

        const routePromises = driverList.map((driver) =>
          getDoc(doc(db, 'routes', driver.routeId))
        );

        const routeDocs = await Promise.all(routePromises);
        const routeMap: Record<string, Route> = {};

        routeDocs.forEach((routeDoc) => {
          if (routeDoc.exists()) {
            const data = routeDoc.data() as Route;
            routeMap[routeDoc.id] = { ...data, id: routeDoc.id };
          }
        });

        setDrivers(driverList);
        setRoutes(routeMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchDriversAndRoutes();
  }, []);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={{ marginTop: 12, color: theme.icon, fontWeight: '600' }}>Syncing Fleet Directory...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <Text style={[styles.title, { color: theme.text }]}>Transport Staff</Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>Official GNA University driver directory</Text>
          </View>
        }
        renderItem={({ item }) => {
          const route = routes[item.routeId];
          return (
            <View style={[styles.card, { backgroundColor: colorScheme === 'light' ? '#fff' : '#1C1C1E' }]}>
              {/* Profile Section */}
              <View style={styles.row}>
                <View style={[styles.avatarCircle, { backgroundColor: '#4a90e2' }]}>
                   <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.details}>
                  <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>VERIFIED DRIVER</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.callBtn} 
                  onPress={() => handleCall(item.phone)}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Route Details */}
              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: '#4a90e215' }]}>
                   <MaterialIcons name="alt-route" size={20} color="#4a90e2" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.icon }]}>ASSIGNED ROUTE</Text>
                  <Text style={[styles.routeValue, { color: theme.text }]}>
                    {route ? route.name : 'System Mapping...'}
                  </Text>
                </View>
              </View>

              {route?.stops && (
                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                  <View style={[styles.iconBox, { backgroundColor: '#20bf6b15' }]}>
                     <FontAwesome5 name="map-marker-alt" size={16} color="#20bf6b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: theme.icon }]}>STOPS</Text>
                    <Text style={[styles.stops, { color: theme.icon }]}>
                      {route.stops.join('  •  ')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerArea: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 3 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  details: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  roleBadge: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  roleText: {
    color: '#4a90e2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  callBtn: {
    backgroundColor: '#20bf6b',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128,128,128,0.08)',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  stops: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default DriversAndRoutesScreen;