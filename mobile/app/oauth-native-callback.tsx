import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth, useSession } from '@clerk/clerk-expo';
import { storage } from '../src/utils/storage';
import { clerkLogin } from '../src/api/auth';
import { AuthContext } from '../src/context/AuthContext';
import { DoctorContext } from '../src/context/DoctorContext';
import { getExpoPushToken } from '../src/utils/notificationHelper';
import api from '../src/api/axiosInstance';

export default function OAuthNativeCallback() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useAuth();
    const { session } = useSession();

    const { setToken, setUser, setRole } = useContext(AuthContext);
    const { setDToken, setProfileData, setDashData } = useContext(DoctorContext);

    const hasHandledLogin = useRef(false);

    useEffect(() => {
        if (hasHandledLogin.current) return;
        if (!isLoaded || !isSignedIn || !session) return;

        hasHandledLogin.current = true;

        const handleLogin = async () => {
            try {
                console.log("✅ Getting Clerk token...");
                const clerkToken = await session.getToken();
                if (!clerkToken) throw new Error("Failed to retrieve Clerk token");

                console.log("✅ Sending to backend...");
                const res = await clerkLogin(clerkToken);
                console.log("✅ Backend Response received, role:", res?.role);

                if (!res?.success) throw new Error("Backend returned failure");

                if (res.role === 'doctor') {
                    await storage.multiRemove(['token', 'refreshToken', 'user']);
                    await storage.setItem('dToken', res.accessToken);
                    await storage.setItem('refreshToken', res.refreshToken);
                    await storage.setItem('role', 'doctor');

                    await setRole('doctor');
                    setDToken(res.accessToken);
                    setProfileData(null);
                    setDashData(null);

                    setTimeout(() => router.replace('/(doctor)/dashboard'), 100);

                } else if (res.role === 'patient') {
                    await storage.multiRemove(['dToken', 'refreshToken']);
                    await setToken(res.accessToken);
                    await setUser(res.user);
                    await setRole('patient');
                    await storage.setItem('refreshToken', res.refreshToken);

                    setDToken(null);
                    setProfileData(null);
                    setDashData(null);

                    setTimeout(() => router.replace('/(patient)/home'), 100);

                    // ✅ Fire-and-forget push token — after redirect, token is saved so this auths correctly
                    getExpoPushToken().then(pushToken => {
                        if (pushToken) {
                            api.post('/api/user/push-token', { pushToken })
                               .catch(e => console.log('Push token registration failed:', e.message));
                        }
                    });

                } else {
                    throw new Error(`Unexpected role in response: ${res?.role}`);
                }

            } catch (err: unknown) {
                console.error('🔥 Callback Error:', err);
                hasHandledLogin.current = false;
                setTimeout(() => router.replace('/(auth)/login'), 100);
            }
        };

        handleLogin();
    }, [isLoaded, isSignedIn, session]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoaded && !isSignedIn) {
                console.log('⏳ SSO timed out, redirecting to login');
                router.replace('/(auth)/login');
            }
        }, 30000);
        return () => clearTimeout(timeout);
    }, [isSignedIn, isLoaded]);

    return (
        <View style={styles.container}>
            <View style={styles.loadingRing}>
                <ActivityIndicator size="large" color="#131c62" />
            </View>
            <Text style={styles.loadingText}>Securing your account…</Text>
        </View>
    );
}

const PRIMARY       = '#131c62';
const PRIMARY_LIGHT = '#EEF1FF';
const PAGE_BG       = '#F8FAFC';

const styles = StyleSheet.create({
    container: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: PAGE_BG, gap: 14,
    },
    loadingRing: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: PRIMARY_LIGHT,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: PRIMARY, shadowOpacity: 0.15, shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 }, elevation: 10,
    },
    loadingText: {
        color: PRIMARY, fontSize: 16, fontWeight: '700', letterSpacing: 0.5, marginTop: 4,
    },
});