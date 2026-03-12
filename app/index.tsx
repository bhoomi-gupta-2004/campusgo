// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, useColorScheme } from 'react-native';
// import { getAuth } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '@/config/firbaseConfig';
// import { Colors } from '@/constants/Colors'; 
// import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// export default function BusFeeScreen() {
//   const [userData, setUserData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const colorScheme = useColorScheme() ?? 'light';
//   const theme = Colors[colorScheme];

//   useEffect(() => {
//     const fetchFeeData = async () => {
//       const user = getAuth().currentUser;
//       if (user) {
//         const snap = await getDoc(doc(db, 'users', user.uid));
//         setUserData(snap.data());
//       }
//       setLoading(false);
//     };
//     fetchFeeData();
//   }, []);

//   const isPaid = userData?.feeStatus === 'paid';

//   if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4a90e2" /></View>;

//   // Security Check: Only students can see this
//   if (userData?.role !== 'student') {
//     return (
//       <View style={[styles.center, { backgroundColor: theme.background }]}>
//         <MaterialCommunityIcons name="lock-alert" size={50} color={theme.icon} />
//         <Text style={[styles.errorText, { color: theme.text }]}>Student Portal Only</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       <Text style={[styles.header, { color: theme.text }]}>Transport Fee</Text>

//       {/* Dynamic Fee Card */}
//       <View style={[styles.feeCard, { backgroundColor: isPaid ? '#20bf6b' : '#4a90e2' }]}>
//         <View style={styles.cardTop}>
//           <Text style={styles.univName}>GNA UNIVERSITY</Text>
//           <Ionicons name="wifi" size={20} color="rgba(255,255,255,0.6)" />
//         </View>
        
//         <View>
//           <Text style={styles.label}>AMOUNT DUE</Text>
//           <Text style={styles.amount}>₹{userData?.feeAmount || '0.00'}</Text>
//         </View>

//         <View style={styles.cardBottom}>
//           <Text style={styles.statusText}>{isPaid ? 'STATUS: PAID' : 'STATUS: PENDING'}</Text>
//           <MaterialCommunityIcons name="integrated-circuit-chip" size={32} color="#f1c40f" />
//         </View>
//       </View>

//       {!isPaid && (
//         <TouchableOpacity style={styles.payButton} onPress={() => Alert.alert("Stripe", "Opening Payment Sheet...")}>
//           <Text style={styles.payButtonText}>Pay with Stripe</Text>
//           <Ionicons name="logo-stripe" size={20} color="#fff" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 24, paddingTop: 60 },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: { fontSize: 32, fontWeight: '900', marginBottom: 30 },
//   feeCard: { height: 220, borderRadius: 24, padding: 24, justifyContent: 'space-between', elevation: 10 },
//   cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
//   univName: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
//   label: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },
//   amount: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 4 },
//   cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   statusText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
//   payButton: { backgroundColor: '#1e272e', height: 60, borderRadius: 16, marginTop: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
//   payButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
//   errorText: { fontSize: 18, fontWeight: '700', marginTop: 10 }
// });