import { db } from "@/config/firebaseConfig";
import { Colors } from "@/constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme
} from "react-native";

export default function AttendanceIndex() {
  const [busNumbers, setBusNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [myBus, setMyBus] = useState<number | null>(null);

  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const user = getAuth().currentUser;

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          const roleValue = data.role?.toLowerCase()?.trim();

          setRole(roleValue);

         
          if (roleValue === "student") {
            setMyBus(data.busNumber);
            setBusNumbers([data.busNumber]); 
          }
        }
      }

      //  ADMIN → ALL BUSES
      if (role !== "student") {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((doc) => doc.data());

        const buses = [
          ...new Set(
            users
              .filter(
                (u) =>
                  u.role?.toLowerCase() === "student" ||
                  u.role?.toLowerCase() === "teacher",
              )
              .map((u) => u.busNumber)
              .filter(Boolean),
          ),
        ];

        setBusNumbers(buses);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={{ padding: 20, backgroundColor: theme.background }}>
      {/* HEADER */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: "900",
          marginBottom: 20,
          color: "white",
        }}
      >
        {role === "student" ? "My Bus Attendance" : "Fleet Dashboard"}
      </Text>

      {/* STUDENT UI */}
      {role === "student" ? (
        <TouchableOpacity
          style={styles.studentCard}
          onPress={() =>
            router.push({
              pathname: "/attendance/[busId]",
              params: { busId: myBus },
            })
          }
        >
          <FontAwesome5 name="bus" size={20} color="#fff" />
          <Text style={styles.studentText}>Bus {myBus}</Text>
        </TouchableOpacity>
      ) : (
        // ADMIN UI
        busNumbers.map((bus, i) => (
          <TouchableOpacity
            key={i}
            style={styles.adminCard}
            onPress={() =>
              router.push({
                pathname: "/attendance/[busId]",
                params: { busId: bus },
              })
            }
          >
            <Text style={{ fontWeight: "800" }}>Bus {bus}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  studentCard: {
    backgroundColor: "#4a90e2",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
  },

  studentText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },

  adminCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
  },
});
