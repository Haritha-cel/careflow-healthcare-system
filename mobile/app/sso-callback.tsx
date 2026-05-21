// import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
// import { useEffect, useContext, useRef } from 'react';
// import { useRouter } from 'expo-router';
// import { useAuth, useSession } from '@clerk/expo'; // ✅ Changed: useSession instead of useUser
// import { storage } from '../src/utils/storage';
// import { clerkLogin } from '../src/api/auth'; // ✅ Changed: Use the new secure clerkLogin function
// import { AuthContext } from '../src/context/AuthContext';
// import { DoctorContext } from '../src/context/DoctorContext';

// export default function SSOCallback() {
//   const router = useRouter();
//   const { isSignedIn } = useAuth();
//   const { session } = useSession(); // ✅ Get the session object to retrieve the JWT

//   const { setToken, setUser, setRole } = useContext(AuthContext);
//   const { setDToken, setProfileData, setDashData } = useContext(DoctorContext);
  
//   const hasHandledLogin = useRef(false);

//   useEffect(() => {
//     const handleLogin = async () => {
//       try {
//         if (!isSignedIn || !session) {
//           return;
//         }

//         if (hasHandledLogin.current) return;
//         hasHandledLogin.current = true;

//         // ✅ 1. Get the short-lived Clerk JWT token
//         const clerkToken = await session.getToken();

//         if (!clerkToken) {
//           throw new Error("Failed to retrieve Clerk token");
//         }

//         // ✅ 2. Send the token to your secure Spring Boot backend (/api/auth/clerk-verify)
//         // The backend will verify the signature, extract email/name securely, 
//         // and issue your custom JWTs!
//         const res = await clerkLogin(clerkToken);

//         // 🔴 DOCTOR FLOW
//         if (res?.role === 'doctor') {
//           // 1. Clear PATIENT keys (token, user)
//           await storage.multiRemove(['token', 'refreshToken', 'user']);
          
//           // 2. Save DOCTOR keys (dToken, refreshToken, role)
//           await storage.setItem('dToken', res.accessToken); 
//           await storage.setItem('refreshToken', res.refreshToken);
//           await storage.setItem('role', 'doctor');
          
//           // 3. Update Context States
//           await setRole('doctor');
//           setDToken(res.accessToken); 
//           setProfileData(null);
//           setDashData(null);
          
//           router.replace('/(doctor)/dashboard');
//         }

//         // 🟢 PATIENT FLOW
//         else if (res) {
//           // 1. Clear DOCTOR keys (dToken)
//           await storage.multiRemove(['dToken', 'refreshToken']);
          
//           // 2. Save PATIENT keys (token, user, refreshToken, role)
//           await setToken(res.accessToken); 
//           await setUser(res.user);
//           await storage.setItem('refreshToken', res.refreshToken);
//           await storage.setItem('role', 'patient');
//           await setRole('patient');
          
//           // 3. Clear doctor context
//           setDToken(null);
//           setProfileData(null);
//           setDashData(null);

//           router.replace('/(patient)/home');
//         } else {
//           throw new Error("No response from server");
//         }

//       } catch (err: unknown) {
//         console.error('🔥 SSO Error:', err);
//         hasHandledLogin.current = false; 
//         router.replace('/(auth)/login');
//       }
//     };

//     handleLogin();
//   }, [isSignedIn, session]);

//   // ⏳ Timeout fallback
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       if (!isSignedIn) {
//         console.log('⏳ SSO timed out, redirecting to login');
//         router.replace('/(auth)/login');
//       }
//     }, 10000);

//     return () => clearTimeout(timeout);
//   }, [isSignedIn]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.loadingRing}>
//         <ActivityIndicator size="large" color="#131c62" />
//       </View>
//       <Text style={styles.loadingText}>Securing your account…</Text>
//     </View>
//   );
// }

// const PRIMARY       = '#131c62';
// const PRIMARY_LIGHT = '#EEF1FF';
// const PAGE_BG      = '#F8FAFC';

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: PAGE_BG,
//     gap: 14,
//   },
//   loadingRing: {
//     width: 64, height: 64, borderRadius: 32, backgroundColor: PRIMARY_LIGHT, 
//     alignItems: 'center', justifyContent: 'center',
//     shadowColor: PRIMARY, shadowOpacity: 0.15, shadowRadius: 20,
//     shadowOffset: { width: 0, height: 8 }, elevation: 10,
//   },
//   loadingText: {
//     color: PRIMARY, fontSize: 16, fontWeight: '700', letterSpacing: 0.5, marginTop: 4,
//   }
// });










// // import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
// // import { useEffect } from 'react';
// // import { useRouter } from 'expo-router';

// // export default function SSOCallback() {
// //   const router = useRouter();

// //   // ✅ FIX: Clerk is removed. Native Google Sign-In handles everything on the login screen.
// //   // If a user accidentally lands here, redirect them back to login.
// //   useEffect(() => {
// //     const timeout = setTimeout(() => {
// //       router.replace('/(auth)/login');
// //     }, 2000);

// //     return () => clearTimeout(timeout);
// //   }, [router]);

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.loadingRing}>
// //         <ActivityIndicator size="large" color="#131c62" />
// //       </View>
// //       <Text style={styles.loadingText}>Redirecting...</Text>
// //     </View>
// //   );
// // }

// // const PRIMARY       = '#131c62';
// // const PRIMARY_LIGHT = '#EEF1FF';
// // const PAGE_BG      = '#F8FAFC';

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: PAGE_BG,
// //     gap: 14,
// //   },
// //   loadingRing: {
// //     width: 64, height: 64, borderRadius: 32, backgroundColor: PRIMARY_LIGHT, 
// //     alignItems: 'center', justifyContent: 'center',
// //     shadowColor: PRIMARY, shadowOpacity: 0.15, shadowRadius: 20,
// //     shadowOffset: { width: 0, height: 8 }, elevation: 10,
// //   },
// //   loadingText: {
// //     color: PRIMARY, fontSize: 16, fontWeight: '700', letterSpacing: 0.5, marginTop: 4,
// //   }
// // });






import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth, useSession } from '@clerk/clerk-expo';
import { storage } from '../src/utils/storage';
import { clerkLogin } from '../src/api/auth';
import { AuthContext } from '../src/context/AuthContext';
import { DoctorContext } from '../src/context/DoctorContext';

export default function SSOCallback() {
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
                const clerkToken = await session.getToken();
                if (!clerkToken) throw new Error("Failed to retrieve Clerk token");

                const res = await clerkLogin(clerkToken);
                console.log("✅ SSO Response, role:", res?.role);

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

                    router.replace('/(doctor)/dashboard');

                } else if (res.role === 'patient') {
                    await storage.multiRemove(['dToken', 'refreshToken']);
                    await setToken(res.accessToken);
                    await setUser(res.user);
                    await setRole('patient');
                    await storage.setItem('refreshToken', res.refreshToken);

                    setDToken(null);
                    setProfileData(null);
                    setDashData(null);

                    router.replace('/(patient)/home');

                } else {
                    throw new Error(`Unexpected role: ${res?.role}`);
                }

            } catch (err: unknown) {
                console.error('🔥 SSO Error:', err);
                hasHandledLogin.current = false;
                router.replace('/(auth)/login');
            }
        };

        handleLogin();
    }, [isLoaded, isSignedIn, session]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoaded && !isSignedIn) {
                console.log('⏳ SSO timed out');
                router.replace('/(auth)/login');
            }
        }, 10000);
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