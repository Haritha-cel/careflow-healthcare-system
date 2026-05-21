import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Animated, useWindowDimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState, useContext, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import GoogleSignIn from '../../src/components/GoogleSignIn';
import { useRouter } from 'expo-router';
import api from '../../src/api/axiosInstance'; // ✅ ADD
import { storage } from '../../src/utils/storage';
import { AuthContext } from '../../src/context/AuthContext';
import { COLORS } from '../../src/styles/Color';
import { DoctorContext } from '../../src/context/DoctorContext';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';

const Login = () => {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width, height) / 375;
  const normalize = (size) => Math.round(size * scale);
  const isSmallDevice = height < 700;
  const isTablet = Math.min(width, height) >= 600;
  const { isSignedIn, signOut } = useAuth();

  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { setUser, setToken, setRole: setUserRole } = useContext(AuthContext);
  const { setDToken } = useContext(DoctorContext);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleDoctorLogin = async () => {
    if (!email || !password) {
        Alert.alert("Error", "Please enter email and password");
        return;
    }
    try {
        setLoading(true);

        // ✅ Clear any stale Clerk session (patient may have been signed in before)
        if (isSignedIn) {
            await signOut();
        }

        const { data: res } = await api.post('/api/auth/doctor/login', { email, password });

        if (!res.success) { Alert.alert("Login Failed", res.message); return; }

        const { accessToken, refreshToken } = res;

        await storage.multiRemove(['token', 'user', 'refreshToken']);
        await storage.setItem('dToken', accessToken);
        await storage.setItem('refreshToken', refreshToken);
        await storage.setItem('role', 'doctor');

        setUserRole('doctor');
        setDToken(accessToken);

        router.replace('/(doctor)/dashboard');
    } catch (err) {
        Alert.alert("Error", err?.response?.data?.message || "Login failed.");
    } finally {
        setLoading(false);
    }
};

  // ✅ Dynamic styles based on screen size
  const dynamicStyles = {
    root: {
      paddingHorizontal: isTablet ? normalize(40) : normalize(20),
      paddingVertical: isSmallDevice ? normalize(20) : normalize(40),
    },

    // Decorative circles
    circleTopLeft: {
      top: -normalize(60),
      left: -normalize(60),
      width: normalize(200),
      height: normalize(200),
      borderRadius: normalize(100),
    },
    circleTopRight: {
      top: normalize(80),
      right: -normalize(80),
      width: normalize(250),
      height: normalize(250),
      borderRadius: normalize(125),
    },
    circleBottomLeft: {
      bottom: normalize(60),
      left: -normalize(100),
      width: normalize(300),
      height: normalize(300),
      borderRadius: normalize(150),
    },

    // Header
    header: { marginBottom: isSmallDevice ? normalize(20) : normalize(30) },
    logoContainer: {
      width: normalize(72),
      height: normalize(72),
      borderRadius: normalize(20),
      marginBottom: normalize(12),
    },
    logoIcon: { fontSize: normalize(36) },
    appName: { fontSize: isTablet ? normalize(32) : normalize(38) },
    tagline: { fontSize: normalize(14), marginTop: 4 },

    // Card
    card: {
      padding: isTablet ? normalize(32) : normalize(24),
      borderRadius: normalize(28),
      maxWidth: isTablet ? width * 0.6 : '100%',
    },

    // Toggle
    toggleRow: {
      borderRadius: normalize(14),
      padding: normalize(4),
      marginBottom: normalize(20),
    },
    toggleBtn: {
      paddingVertical: normalize(10),
      borderRadius: normalize(11),
    },
    toggleBtnText: { fontSize: normalize(14) },

    // Text
    cardTitle: {
      fontSize: isTablet ? normalize(20) : normalize(22),
      marginBottom: normalize(4),
    },
    cardSubtitle: {
      fontSize: normalize(13),
      marginBottom: normalize(20),
    },

    // Divider
    dividerText: { fontSize: normalize(12) },
    helperText: {
      fontSize: normalize(12),
      lineHeight: normalize(18),
    },

    // Form
    form: { gap: normalize(12) },
    inputWrapper: {
      borderRadius: normalize(14),
      paddingHorizontal: normalize(14),
      height: isSmallDevice ? normalize(48) : normalize(52),
    },
    inputIcon: { fontSize: normalize(16), marginRight: normalize(10) },
    input: { fontSize: normalize(15) },

    // ✅ Eye icon
    eyeButton: {
      padding: normalize(8),
      marginLeft: normalize(4),
    },
    eyeIcon: { fontSize: normalize(20) },

    // Button
    loginBtn: { borderRadius: normalize(14) },
    loginBtnGradient: {
      paddingVertical: isSmallDevice ? normalize(14) : normalize(16),
    },
    loginBtnText: { fontSize: normalize(16) },

    // Footer
    footer: {
      marginTop: normalize(24),
      fontSize: normalize(12),
    },
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.root, dynamicStyles.root, { minHeight: height }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={[COLORS.PRIMARY, '#3b0070', '#7c3aed', '#a78bfa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Decorative circles */}
        <View style={[styles.circle, dynamicStyles.circleTopLeft, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        <View style={[styles.circle, dynamicStyles.circleTopRight, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
        <View style={[styles.circle, dynamicStyles.circleBottomLeft, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

        {/* Header */}
        <Animated.View style={[styles.header, dynamicStyles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.logoContainer, dynamicStyles.logoContainer]}>
            <Text style={[styles.logoIcon, dynamicStyles.logoIcon]}>⚕️</Text>
          </View>
          <Text style={[styles.appName, dynamicStyles.appName]}>CareFlow</Text>
          <Text style={[styles.tagline, dynamicStyles.tagline]}>Your health, our priority</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, dynamicStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Role Toggle */}
          <View style={[styles.toggleRow, dynamicStyles.toggleRow]}>
            <TouchableOpacity
              style={[styles.toggleBtn, dynamicStyles.toggleBtn, role === 'patient' && styles.toggleBtnActive]}
              onPress={() => setRole('patient')}
            >
              <Text style={[styles.toggleBtnText, dynamicStyles.toggleBtnText, role === 'patient' && styles.toggleBtnTextActive]}>
                🧑 Patient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, dynamicStyles.toggleBtn, role === 'doctor' && styles.toggleBtnActive]}
              onPress={() => setRole('doctor')}
            >
              <Text style={[styles.toggleBtnText, dynamicStyles.toggleBtnText, role === 'doctor' && styles.toggleBtnTextActive]}>
                👨‍⚕️ Doctor
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>
            {role === 'patient' ? 'Welcome Back!' : 'Doctor Portal'}
          </Text>
          <Text style={[styles.cardSubtitle, dynamicStyles.cardSubtitle]}>
            {role === 'patient' ? 'Sign in to manage your appointments' : 'Sign in with your credentials'}
          </Text>

          {/* Patient — Google */}
          {role === 'patient' ? (
            <View style={styles.googleSection}>
              <GoogleSignIn />
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, dynamicStyles.dividerText]}>Secure Login</Text>
                <View style={styles.dividerLine} />
              </View>
              <Text style={[styles.helperText, dynamicStyles.helperText]}>
                We use Google Sign-In to keep your health data safe and secure.
              </Text>
            </View>
          ) : (
            /* Doctor — Email/Password */
            <View style={[styles.form, dynamicStyles.form]}>
              <View style={[styles.inputWrapper, dynamicStyles.inputWrapper]}>
                <Text style={[styles.inputIcon, dynamicStyles.inputIcon]}>✉️</Text>
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, dynamicStyles.input]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* ✅ Password with Show/Hide Icon */}
              <View style={[styles.inputWrapper, dynamicStyles.inputWrapper]}>
                <Text style={[styles.inputIcon, dynamicStyles.inputIcon]}>🔒</Text>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  style={[styles.input, dynamicStyles.input]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={[styles.eyeButton, dynamicStyles.eyeButton]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={normalize(22)}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, dynamicStyles.loginBtn]}
                onPress={handleDoctorLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[COLORS.PRIMARY, '#3b0070']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.loginBtnGradient, dynamicStyles.loginBtnGradient]}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={[styles.loginBtnText, dynamicStyles.loginBtnText]}>Sign In →</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>

        {/* Footer */}
        <Animated.Text style={[styles.footer, dynamicStyles.footer, { opacity: fadeAnim }]}>
          🔐 256-bit encrypted · HIPAA compliant
        </Animated.Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Base circle style
  circle: {
    position: 'absolute',
  },

  // Header
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 15,
  },

  // Role toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#0B3DA9',
  },

  cardTitle: {
    fontWeight: '700',
    color: '#1e293b',
  },
  cardSubtitle: {
    color: '#94a3b8',
  },

  // Google section
  googleSection: {
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
  },
  helperText: {
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Form
  form: {},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    color: '#1e293b',
  },

  // ✅ Eye button
  eyeButton: {},

  // Login button
  loginBtn: {
    overflow: 'hidden',
    marginTop: 4,
  },
  loginBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
  },
});