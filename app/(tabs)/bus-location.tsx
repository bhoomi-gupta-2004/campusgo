import { db } from "@/config/firbaseConfig";
import * as Location from "expo-location";
import { getAuth } from "firebase/auth";
import {
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function BusTracking() {
  const [busLocations, setBusLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  // 🔹 You should fetch role + busNumber from Firestore user collection
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribeUser = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      },
    );

    return () => unsubscribeUser();
  }, []);

  useEffect(() => {
    if (!userData) return;

    // ================= DRIVER =================
    if (userData.role === "Driver") {
      let locationSubscription: any;

      const startTracking = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert("Permission Denied");
          setLoading(false);
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          async (loc) => {
            try {
              const driverRef = doc(db, "drivers", user.uid);

              await updateDoc(driverRef, {
                lastKnownLat: loc.coords.latitude,
                lastKnownLng: loc.coords.longitude,
                lastUpdated: new Date().toISOString(),
              });

              setBusLocations([
                {
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                  name: "You",
                  busNumber: userData.busNumber,
                },
              ]);
            } catch (e) {
              console.log(e);
            }
          },
        );

        setLoading(false);
      };

      startTracking();

      return () => {
        if (locationSubscription) locationSubscription.remove();
      };
    }

    // ================= STUDENT =================
    if (userData.role === "Student") {
     const q = collection(db, "drivers");

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const buses: any[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

         if (data.lastKnownLat != null && data.lastKnownLng != null) {
            buses.push({
              latitude: data.lastKnownLat,
              longitude: data.lastKnownLng,
              name: data.name,
              busNumber: data.busNumber,
            });
          }
        });

        setBusLocations(buses);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  // ================= UI =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: busLocations[0]?.latitude || 30.901,
          longitude: busLocations[0]?.longitude || 75.857,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {busLocations.map((bus, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: bus.latitude,
              longitude: bus.longitude,
            }}
            title={`Bus ${bus.busNumber}`}
            description={`Driver: ${bus.name}`}
          >
            <View style={styles.markerContainer}>
              <Text style={{ fontSize: 30 }}>🚌</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {busLocations.length === 0 && (
  <Text style={{ position: "absolute", top: 100 }}>
    🚫 No buses available
  </Text>
)}

      <View style={styles.overlay}>
        <Text style={styles.statusText}>
          {userData.role === "Driver"
            ? "🔴 Live Tracking"
            : "🟢 Tracking Route Buses"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: { marginTop: 10, color: "#666" },
  markerContainer: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4a90e2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlay: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 5,
  },
  statusText: { fontWeight: "bold", color: "#333" },
});
