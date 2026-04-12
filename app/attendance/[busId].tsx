import { db } from "@/config/firebaseConfig";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function BusAttendanceScreen() {
  const { busId } = useLocalSearchParams();

  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>({});
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [toast, setToast] = useState("");

  const [monthlyData, setMonthlyData] = useState<any>({});

  const theme = Colors[useColorScheme() ?? "light"];
  const dateKey = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const currentUser = getAuth().currentUser;
      let roleValue = "";
      let uid = "";

      if (currentUser) {
        uid = currentUser.uid;
        const userDoc = await getDoc(doc(db, "users", uid));
        roleValue = userDoc.data()?.role?.toLowerCase()?.trim();
        setRole(roleValue);
      }

      const snapshot = await getDocs(collection(db, "users"));

      let allUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (u: any) =>
            (u.role?.toLowerCase() === "student" ||
              u.role?.toLowerCase() === "teacher") &&
            u.busNumber == busId
        );

      if (roleValue === "student") {
        allUsers = allUsers.filter((u) => u.id === uid);
      }

      setUsers(allUsers);

      const ref = doc(db, "attendance", String(busId), "records", dateKey);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAttendance(snap.data().records);
      } else {
        const initial: any = {};
        allUsers.forEach((u) => (initial[u.id] = "absent"));
        setAttendance(initial);
      }

      // MONTHLY DATA
      if (roleValue === "student") {
        const recordsRef = collection(db, "attendance", String(busId), "records");
        const monthlySnap = await getDocs(recordsRef);

        const monthly: any = {};

        monthlySnap.forEach((docSnap) => {
          const data = docSnap.data();
          const rec = data.records || {};
          if (rec[uid]) {
            monthly[docSnap.id] = rec[uid];
          }
        });

        setMonthlyData(monthly);
      }

      setLoading(false);
    };

    fetchData();
  }, [busId, dateKey]);

  const toggleAttendance = (id: string) => {
    if (role !== "admin") return;

    setAttendance((prev: any) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const saveAttendance = async () => {
    if (role !== "admin") return;

    const ref = doc(db, "attendance", String(busId), "records", dateKey);
    await setDoc(ref, { date: dateKey, records: attendance });

    setToast("Attendance Saved ✅");

    setTimeout(() => setToast(""), 2000);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ padding: 20, backgroundColor: theme.background }}>
        <Text style={styles.heading}>Bus {busId}</Text>

        {/* STUDENT MONTHLY DASHBOARD */}
        {role === "student" && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.subHeading}>Monthly Attendance</Text>

            <View style={styles.calendar}>
              {Object.keys(monthlyData).map((d) => (
                <View
                  key={d}
                  style={[
                    styles.day,
                    {
                      backgroundColor:
                        monthlyData[d] === "present"
                          ? "#20bf6b"
                          : "#eb3b5a",
                    },
                  ]}
                >
                  <Text style={styles.dayText}>{d.slice(8)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {role === "admin" && (
          <>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={18} />
              <Text>{dateKey}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                onChange={(e, d) => {
                  setShowDatePicker(false);
                  if (d) setSelectedDate(d);
                }}
              />
            )}
          </>
        )}

        {users.map((u) => (
          <View key={u.id} style={styles.card}>
            <Text style={styles.name}>{u.name}</Text>

            {role === "admin" ? (
              <TouchableOpacity onPress={() => toggleAttendance(u.id)}>
                <Text>{attendance[u.id]}</Text>
              </TouchableOpacity>
            ) : (
              <Text>{attendance[u.id]}</Text>
            )}
          </View>
        ))}

        {role === "admin" && (
          <TouchableOpacity style={styles.saveBtn} onPress={saveAttendance}>
            <Text style={{ color: "#fff" }}>Save</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* TOAST */}
      {toast !== "" && (
        <View style={styles.toast}>
          <Text style={{ color: "#fff" }}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
    color: "white",
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  day: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    color: "#fff",
    fontWeight: "900",
  },
  dateBtn: {
    padding: 10,
    backgroundColor: "#eee",
    marginBottom: 15,
  },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontWeight: "800",
  },
  saveBtn: {
    backgroundColor: "#4a90e2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  toast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});