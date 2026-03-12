// import React, { useState } from 'react';
// import {
//   View, Text, TextInput, Alert, StyleSheet,
//   TouchableOpacity, ScrollView, Image
// } from 'react-native';
// import { createUserWithEmailAndPassword } from 'firebase/auth';
// import { doc, setDoc } from 'firebase/firestore';
// import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import { db,auth } from '@/config/firbaseConfig';
// import { Picker } from '@react-native-picker/picker';

// export default function SignupScreen() {
//   const router = useRouter();

//   const [name, setName] = useState('');
//   const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('student');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [profilePic, setProfilePic] = useState<string | null>(null);

//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.5,
//     });

//     if (!result.canceled) {
//       setProfilePic(result.assets[0].uri);
//     }
//   };

//   const handleSignup = async () => {
//     if (!name || !email || !password || !confirmPassword) {
//       Alert.alert('Error', 'Please fill all the fields');
//       return;
//     }

//     if (password !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Save user data to Firestore
//       await setDoc(doc(db, 'users', user.uid), {
//         uid: user.uid,
//         name,
//         email,
//         role,
//         profilePic: profilePic || '', // can be empty for now
//       });

//       Alert.alert('Success', 'Account created successfully!');
//       router.replace('/auth/login');
//     } catch (error: any) {
//       Alert.alert('Signup Failed', error.message);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Create an Account</Text>

//       <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
//         <Image
//           source={
//             profilePic
//               ? { uri: profilePic }
//               : require('../../assets/images/favicon.png') // use your own placeholder image
//           }
//           style={styles.avatar}
//         />
//         <Text style={styles.avatarText}>Tap to select profile picture</Text>
//       </TouchableOpacity>

//       <TextInput
//         placeholder="Full Name"
//         value={name.trim()}
//         onChangeText={setName}
//         style={styles.input}
//       />

//       <TextInput
//         placeholder="Email"
//         value={email.trim()}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         keyboardType="email-address"
//         style={styles.input}
//       />

//       <TextInput
//         placeholder="Password"
//         value={password.trim()}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={styles.input}
//       />

//       <TextInput
//         placeholder="Confirm Password"
//         value={confirmPassword.trim()}
//         onChangeText={setConfirmPassword}
//         secureTextEntry
//         style={styles.input}
//       />

//       <Text style={styles.label}>Select Role:</Text>
//       <View style={styles.pickerContainer}>
//         <Picker
//           selectedValue={role}
//           onValueChange={(itemValue) => setRole(itemValue as 'admin' | 'teacher' | 'student')}
//         >
//           <Picker.Item label="Student" value="student" />
//           <Picker.Item label="Teacher" value="teacher" />
//           <Picker.Item label="Admin" value="admin" />
//         </Picker>
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleSignup}>
//         <Text style={styles.buttonText}>Sign Up</Text>
//       </TouchableOpacity>

//       <Text style={styles.link} onPress={() => router.push('/auth/login')}>
//         Already have an account? Log in
//       </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     backgroundColor: '#C4964B',
//     flexGrow: 1,
//     justifyContent: 'center',
//     flexDirection:'column',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 24,
//     textAlign: 'center',
//     color: '#333',
//   },
//   avatarWrapper: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   avatar: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: '#ddd',
//   },
//   avatarText: {
//     marginTop: 8,
//     color: '#666',
//     fontSize: 12,
//   },
//   input: {
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 12,
//     marginBottom: 16,
//     borderRadius: 8,
//   },
//   label: {
//     marginBottom: 8,
//     fontWeight: '600',
//     color: '#555',
//   },
//   pickerContainer: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     marginBottom: 24,
//   },
//   button: {
//     backgroundColor: '#D74E49',
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   link: {
//     textAlign: 'center',
//     marginTop: 10,
//     color: '#D74E49',
//   },
// });
