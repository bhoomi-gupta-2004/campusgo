import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const { width, height } = Dimensions.get("window");

function BusLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert(
          "Location Permission Denied",
          "Please enable location services.",
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const { city, region, country } = reverseGeocode[0];
        setAddress(`${city || ""}, ${region || ""}, ${country || ""}`);
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, 5 * 60 * 1000); // every 5 minutes

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🚌 Live Bus Location</Text>

      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : loading || !location ? (
        <ActivityIndicator size="large" color="#4a90e2" />
      ) : (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Bus Location"
              description={address || "Current location"}
            />
          </MapView>

          <View style={styles.infoCard}>
            {address && (
              <Text style={styles.label}>
                Address: <Text style={styles.value}>{address}</Text>
              </Text>
            )}
            <Text style={styles.timestamp}>
              Last updated: {new Date(location.timestamp).toLocaleTimeString()}
            </Text>

            <Pressable onPress={fetchLocation} style={styles.refreshButton}>
              <Ionicons name="refresh-circle" size={28} color="white" />
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#34495e",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  map: {
    width: width,
    height: height * 0.5,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 18,
    margin: 14,
    borderRadius: 14,
    elevation: 4,
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    marginTop: 6,
    color: "#444",
  },
  value: {
    fontWeight: "normal",
    color: "#555",
  },
  timestamp: {
    marginTop: 10,
    fontSize: 12,
    color: "#777",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a90e2",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  refreshText: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "600",
  },
});

export default BusLocation;
