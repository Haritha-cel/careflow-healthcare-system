import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, ReactNode } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, StatusBar } from 'react-native';
import { ClerkProvider } from '@clerk/clerk-expo'; // ✅ Must be imported

import AppProvider from "../src/context/AppProvider";
import AuthProvider, { useAuth } from "../src/context/AuthContext";
import DoctorContextProvider from "../src/context/DoctorContext";
import { StripeProvider } from '@stripe/stripe-react-native';
import { configureNotifications } from "../src/utils/notificationHelper";
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();


const PRIMARY = '#131c62';
const PRIMARY_LIGHT = '#EEF1FF';
const PAGE_BG = '#F8FAFC';

const queryClient = new QueryClient();
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
// ✅ NEW: Add your Clerk Publishable Key here
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function AuthGuard({ children }: { children: ReactNode }) {
  const { token, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // ✅ Let the callback screen handle its own navigation
    const isOAuthCallback =
        segments[0] === 'oauth-native-callback' ||
        segments[0] === 'sso-callback';
    if (isOAuthCallback) return;  // ← already in your code, confirm it's there

    const inAuthGroup = segments[0] === '(auth)';
    const inPatientGroup = segments[0] === '(patient)';
    const inDoctorGroup = segments[0] === '(doctor)';

    // ─── DOCTOR LOGIC ──────────────────────────────
    if (role === 'doctor') {
      if (inAuthGroup) {
        router.replace('/(doctor)/dashboard');
      }
      else if (inPatientGroup) {
        router.replace('/(doctor)/dashboard');
      }
      return;
    }

    // ─── PATIENT LOGIC ────────────────────────────
      if (!token && !inAuthGroup && role !== 'patient'){
      router.replace('/(auth)/onboarding');
    } else if (token && inAuthGroup) {
      router.replace('/(patient)/home');
    } else if (token && inDoctorGroup) {
      router.replace('/(patient)/home');
    }

  }, [token, loading, role, segments]);

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
        <View style={styles.loadingRing}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
        <Text style={styles.loadingText}>Initializing App…</Text>
      </View>
    );
  }
  return <>{children}</>;
}

// export default function RootLayout() {

//   useEffect(() => {
//     configureNotifications();
//   }, []);

export default function RootLayout() {
  useEffect(() => { configureNotifications(); }, []);

  // ✅ SAFETY CHECK: If the key is missing, show an error screen instead of crashing
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>
          Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env
        </Text>
      </View>
    );
  }

  return (
    // ✅ WRAP EVERYTHING IN CLERK PROVIDER
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme="careflow">
        <AppProvider>
          <AuthProvider>
            <DoctorContextProvider>
              <QueryClientProvider client={queryClient}>
                <AuthGuard>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: PAGE_BG },
                      animation: 'slide_from_right',
                    }}
                  >
                    <Stack.Screen name="(auth)/login" />
                    <Stack.Screen name="(auth)/onboarding" />
                    {/* ✅ ADD THIS: Clerk OAuth Callback Route */}
                    <Stack.Screen name="oauth-native-callback" options={{ headerShown: false }} />
                    <Stack.Screen name="(patient)" />
                    <Stack.Screen name="(doctor)" />
                    <Stack.Screen name="(common)/chat" options={{ headerShown: false }} />
                    <Stack.Screen name="(common)/payment-screen" options={{ headerShown: false }} />
                  </Stack>
                </AuthGuard>
              </QueryClientProvider>
            </DoctorContextProvider>
          </AuthProvider>
        </AppProvider>
      </StripeProvider>
    </ClerkProvider>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PAGE_BG,
    gap: 14,
  },
  loadingRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  loadingText: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  }
});