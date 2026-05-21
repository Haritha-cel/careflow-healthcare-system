import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, Platform, Dimensions } from 'react-native'
import React, { useContext, useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications';
import api from '../api/axiosInstance';
import { COLORS } from '../styles/Color'
import { useRouter } from 'expo-router'
import { AuthContext } from '../context/AuthContext'
import { getExpoPushToken } from '../utils/notificationHelper';
import dayjs from 'dayjs'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const Header = () => {
    const router = useRouter();
    const { user, token } = useContext(AuthContext);
    const notificationListener = useRef();
    const responseListener = useRef();

    // ── REGISTER PUSH TOKEN ONCE ─────────────────────────────
    useEffect(() => {
        if (!token) return;

        const registerToken = async () => {
            const pushToken = await getExpoPushToken();
            if (pushToken) {
                try {
                    await api.post('/api/user/push-token', { pushToken });
                    console.log('✅ Push token registered');
                } catch (e) {
                    console.log('Push token registration failed:', e.message);
                }
            }
        };

        registerToken();
    }, [token]);

    // ── HANDLE INCOMING PUSH NOTIFICATIONS ───────────────────
    useEffect(() => {
        // Fires when notification arrives while app is OPEN
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            const { type } = notification.request.content.data || {};
            console.log('📬 Push received:', type);
        });

        // Fires when user TAPS a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const { appointmentId, type } = response.notification.request.content.data || {};
            console.log('👆 Notification tapped:', type, appointmentId);
            if (appointmentId) {
                router.push('/(patient)/my-appointments');
            }
        });

        return () => {
            // ✅ Fix: subscriptions have a .remove() method directly
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    // ── FETCH APPOINTMENTS ────────────────────────────────────
    const { data: apptData } = useQuery({
        queryKey: ['headerAppointments'],
        queryFn: async () => {
            const { data } = await api.get('/api/user/appointments');
            return data;
        },
        enabled: !!token
    });

    // ── REMINDER LOGIC ────────────────────────────────────────
    const { hasReminder, nextAppointment } = React.useMemo(() => {
        if (!apptData?.appointments) return { hasReminder: false, nextAppointment: null };

        const now = new Date();
        const active = apptData.appointments.filter(a => {
            if (a.cancelled || a.completed) return false;
            try {
                return dayjs(`${a.slotDate} ${a.slotTime}`, 'YYYY-MM-DD hh:mm A').isAfter(now);
            } catch { return false; }
        });

        if (active.length === 0) return { hasReminder: false, nextAppointment: null };

        const sorted = [...active].sort((a, b) =>
            dayjs(`${a.slotDate} ${a.slotTime}`, 'YYYY-MM-DD hh:mm A').isBefore(
                dayjs(`${b.slotDate} ${b.slotTime}`, 'YYYY-MM-DD hh:mm A')
            ) ? -1 : 1
        );

        const next = sorted[0];
        return {
            hasReminder: !!(next?.reminderMinutes && next.reminderMinutes > 0),
            nextAppointment: next
        };
    }, [apptData]);

    // ── BELL PRESS ────────────────────────────────────────────
    const handleBellPress = () => {
        if (!nextAppointment) {
            Alert.alert("No Upcoming Appointments", "You have no upcoming appointments.");
            return;
        }

        if (hasReminder) {
            Alert.alert(
                "🔔 Reminder Active",
                `Reminder set for your appointment with ${nextAppointment.docData?.name}\n` +
                `📅 ${nextAppointment.slotDate} at ${nextAppointment.slotTime}\n` +
                `⏰ ${nextAppointment.reminderMinutes} min before`,
                [{ text: "View Appointments", onPress: () => router.push('/(patient)/my-appointments') },
                { text: "OK" }]
            );
        } else {
            Alert.alert(
                "🔕 No Reminder Set",
                "You haven't set a reminder for your next appointment.",
                [{ text: "View Appointments", onPress: () => router.push('/(patient)/my-appointments') },
                { text: "OK" }]
            );
        }
    };

    // ── RESPONSIVE SIZES ──────────────────────────────────────
    const avatarSize = isSmallDevice ? 44 : 50;
    const greetingFontSize = isSmallDevice ? 13 : 15;
    const nameFontSize = isSmallDevice ? 16 : 19;
    const bellIconSize = isSmallDevice ? 22 : 26;
    const searchHeight = isSmallDevice ? 46 : 50;

    return (
        <View style={styles.container}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            <Animated.View
                style={styles.profile}
                entering={FadeInDown.duration(500).springify()}
            >
                <View style={styles.profileLeft}>
                    <View style={[styles.imageContainer, { width: avatarSize, height: avatarSize }]}>
                        <Image
                            style={[styles.image, { width: avatarSize - 4, height: avatarSize - 4, borderRadius: (avatarSize - 4) / 2 }]}
                            source={user?.image ? { uri: user.image } : require('../assets/img/user.png')}
                        />
                        <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.bio}>
                        <Text style={[styles.greeting, { fontSize: greetingFontSize }]}>Hello, Welcome 👋</Text>
                        <Text style={[styles.userName, { fontSize: nameFontSize }]}>{user?.name || "Username"} ✨</Text>
                    </View>
                </View>

                <Animated.View entering={FadeInRight.duration(400).delay(200)}>
                    <TouchableOpacity
                        style={styles.bellIcon}
                        onPress={handleBellPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={hasReminder ? "notifications" : "notifications-outline"}
                            size={bellIconSize}
                            color={COLORS.HEADER}
                        />
                        {hasReminder && <View style={styles.notificationBadge} />}
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.duration(500).delay(150).springify()}
                style={styles.searchWrapper}
            >
                <TouchableOpacity
                    onPress={() => router.push('/(patient)/search')}
                    style={[styles.searchBar, { height: searchHeight }]}
                    activeOpacity={0.8}
                >
                    <Ionicons name="search" size={isSmallDevice ? 18 : 20} color="rgba(255, 255, 255, 0.7)" />
                    <Text style={[styles.searchText, { fontSize: isSmallDevice ? 14 : 16 }]}>
                        Search doctors, specialities...
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export default Header;

// styles unchanged from your original
const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.PRIMARY,
        paddingTop: Platform.OS === 'android' ? 15 : 10,
        paddingBottom: 24,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
            android: { elevation: 10 },
        }),
    },
    decorativeCircle1: { position: 'absolute', width: width * 0.3, height: width * 0.3, borderRadius: width * 0.15, backgroundColor: 'rgba(255, 255, 255, 0.06)', top: -width * 0.12, right: -width * 0.08 },
    decorativeCircle2: { position: 'absolute', width: width * 0.15, height: width * 0.15, borderRadius: width * 0.075, backgroundColor: 'rgba(255, 255, 255, 0.04)', bottom: 30, left: -width * 0.04 },
    profile: { paddingHorizontal: isSmallDevice ? 16 : 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
    profileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    imageContainer: { borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderWidth: 2.5, borderColor: COLORS.HEADER, justifyContent: 'center', alignItems: 'center' },
    image: { backgroundColor: 'rgba(255, 255, 255, 0.1)', resizeMode: 'cover' },
    onlineIndicator: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ADE80', borderWidth: 2, borderColor: COLORS.PRIMARY },
    bio: { flexDirection: 'column', paddingLeft: isSmallDevice ? 10 : 14 },
    greeting: { color: 'rgba(255, 255, 255, 0.8)', fontWeight: '400' },
    userName: { color: COLORS.HEADER, fontWeight: '700', marginTop: 2 },
    bellIcon: { alignSelf: 'center', padding: isSmallDevice ? 10 : 12, backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
    notificationBadge: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: COLORS.PRIMARY },
    searchWrapper: { paddingHorizontal: isSmallDevice ? 16 : 20, marginTop: 20, zIndex: 2 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.18)', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', gap: 10 },
    searchText: { flex: 1, color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500' },
});