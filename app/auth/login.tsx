import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { Colors } from '@/constants/Colors'; 
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(''); // ✅ added

  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setError(""); // clear previous error

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      let message = "Invalid email or password";

      if (err.code === "auth/user-not-found") {
        message = "No account found with this email";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email format";
      } else if (err.code === "auth/invalid-credential") {
        message = "Invalid email or password";
      }

      setError(message); // ✅ show below field
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {/* Top Logo Section */}
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: '#fff', shadowColor: theme.text }]}>
              <Image
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Bus Tracker
            </Text>
            <Text style={[styles.subtitle, { color: theme.icon }]}>
              Sign in to manage transportation
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Email */}
            <View style={[styles.inputWrapper, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
              <Ionicons name="mail-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email Address"
                placeholderTextColor={theme.icon}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(""); 
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={[styles.inputWrapper, { backgroundColor: colorScheme === 'light' ? '#F2F2F7' : '#2C2C2E' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.icon} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.icon}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(""); 
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={theme.icon} 
                />
              </TouchableOpacity>
            </View>

            {/* ✅ ERROR MESSAGE BELOW PASSWORD */}
            {error ? (
              <Text style={{ color: "red", marginBottom: 10 }}>
                {error}
              </Text>
            ) : null}

            {/* Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Log In</Text>
              <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={14} color={theme.icon} />
              <Text style={[styles.securityText, { color: theme.icon }]}>
                SECURE AUTHENTICATION
              </Text>
            </View>
          </View>

          <Text style={[styles.footer, { color: theme.icon }]}>
            Authorized Personnel Only
          </Text>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 64,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4a90e2', 
    flexDirection: 'row',
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: { shadowColor: '#4a90e2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
    opacity: 0.5,
  },
  securityText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 60,
    opacity: 0.4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});