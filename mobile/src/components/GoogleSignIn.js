import React, { useRef, useState } from 'react';
import { Image, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isHandling = useRef(false); // ✅ prevents double-tap

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const { isSignedIn, signOut } = useAuth();

    const handleSignIn = async () => {
        if (isHandling.current) return; // ✅ block double-tap
        isHandling.current = true;
        setLoading(true);

        try {
            // ✅ If Clerk already has a live session, clear it first.
            // This happens when the user logged out of the app but Clerk's
            // internal session token persisted — causing "already signed in".
            if (isSignedIn) {
                console.log("⚠️ Stale Clerk session found — clearing before new login");
                await signOut();
                await new Promise(resolve => setTimeout(resolve, 300)); // let Clerk settle
            }

            const redirectUrl = Linking.createURL('/oauth-native-callback');
            console.log('🔍 Redirect URL:', redirectUrl);

            const { createdSessionId, setActive, authSessionResult } =
                await startOAuthFlow({ redirectUrl });

            console.log('🔍 createdSessionId:', createdSessionId);
            console.log('🔍 authSessionResult:', authSessionResult?.type);

            if (createdSessionId) {
                // New session created — activate and navigate to callback
                await setActive({ session: createdSessionId });
                router.replace('/oauth-native-callback');

            } else if (
                authSessionResult?.type === 'dismiss' ||
                authSessionResult?.type === 'cancel'
            ) {
                // User cancelled — do nothing
                console.log('User cancelled OAuth');

            } else {
                // Deep-link flow on some devices — session handled by callback
                console.log('🔄 No createdSessionId, navigating to callback');
                router.replace('/oauth-native-callback');
            }

        } catch (err) {
            const errorMessage = err?.errors?.[0]?.message || err?.message || '';
            const isCancelled =
                errorMessage.toLowerCase().includes('cancel') ||
                errorMessage.toLowerCase().includes('dismiss');

            if (isCancelled) {
                // User cancelled — silent, no alert needed
                console.log('OAuth cancelled by user');

            } else if (
                errorMessage.toLowerCase().includes('already signed in') ||
                err?.clerkError?.errors?.[0]?.code === 'identifier_already_signed_in'
            ) {
                // ✅ Stale session that wasn't caught by isSignedIn check above
                // (can happen with timing). The session is usable — just navigate.
                console.log("⚠️ Already signed in — navigating to callback to use existing session");
                router.replace('/oauth-native-callback');

            } else {
                console.error('🔥 Real OAuth Error:', err);
                Alert.alert('Login Failed', errorMessage || 'Something went wrong. Please try again.');
            }

        } finally {
            setLoading(false);
            isHandling.current = false;
        }
    };

    return (
        <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            style={styles.button}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#000" />
            ) : (
                <>
                    <Image
                        source={require('../assets/img/google_icon.png')}
                        style={styles.icon}
                    />
                    <Text style={styles.text}>Continue with Google</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'white',
        flexDirection: 'row',
        gap: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 10,
    },
    text: { color: 'black', fontSize: 16, fontWeight: '500' },
    icon: { width: 20, height: 20 },
});