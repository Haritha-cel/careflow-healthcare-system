import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useContext, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import api from "../../src/api/axiosInstance";
import { AuthContext } from "../../src/context/AuthContext";
import { useAppContext } from "../../src/context/AppProvider";
import { useFocusEffect, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { COLORS } from "../../src/styles/Color";

const PRIMARY = COLORS.PRIMARY;
const DANGER = '#F72585';
const SUCCESS = '#2DC653';
const TEXT_MAIN = '#1A1A2E';
const TEXT_MUTED = '#7B7F9E';
const PAGE_BG = '#F0F4FF';

const MyAppointments = () => {
    const { token, user } = useContext(AuthContext);
    const { unreadCounts, markAsRead } = useAppContext();
    const queryClient = useQueryClient();

    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);

    const [appointments, setAppointments] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);
    const router = useRouter();

    const dynamicStyles = {
        header: { height: normalize(60), marginBottom: normalize(10) },
        backIconSize: normalize(28),
        headerTitle: { fontSize: normalize(18), marginLeft: normalize(10) },
        emptyEmoji: { fontSize: normalize(48), marginBottom: normalize(12) },
        emptyText: { fontSize: normalize(16), marginBottom: normalize(8) },
        emptySubText: { fontSize: normalize(13) },

        card: { marginBottom: normalize(12), borderRadius: normalize(16), padding: normalize(12) },
        // ✅ NEW: Round the top corners of the line so it respects the card's border radius
        // This allows us to remove overflow: 'hidden' and fix the Android disappearing bug
        unreadLine: {
            borderTopLeftRadius: normalize(16),
            borderTopRightRadius: normalize(16),
        },
        avatar: { width: normalize(90), height: normalize(90), borderRadius: normalize(45) },
        avatarPlaceholder: { fontSize: normalize(12) },
        infoContainer: { marginLeft: normalize(12), flex: 1, justifyContent: 'center' },
        name: { fontSize: normalize(16) },
        dot: { width: normalize(10), height: normalize(10), borderRadius: normalize(5) },
        specialty: { fontSize: normalize(13), marginTop: normalize(2) },
        dateText: { fontSize: normalize(12), marginTop: normalize(8) },
        actionsRow: { marginTop: normalize(12), gap: normalize(8) },
        actionBtn: { paddingVertical: normalize(8), paddingHorizontal: normalize(12), borderRadius: normalize(8) },
        actionText: { fontSize: normalize(12) },
    };

    const slotDateFormat = (slotDate) => {
        if (!slotDate) return '';
        if (slotDate.includes('-')) {
            const [year, month, day] = slotDate.split('-');
            const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${day} ${months[Number(month)]} ${year}`;
        }
        const d = slotDate.split("_");
        const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d[0]} ${months[Number(d[1])]} ${d[2]}`;
    };

    const getUserAppointments = async () => {
        try {
            // ✅ FIX: Use api instance
            const { data } = await api.get('/api/user/appointments');
            if (data.success) setAppointments(data.appointments.reverse());
        } catch (error) {
            Alert.alert("Error", "Failed to fetch appointments");
        }
    };

    const cancelAppointment = (item) => {
        const apptId = item.id ?? item._id;
        Alert.alert(
            '⚠️ Cancel Appointment',
            `Are you sure you want to cancel your appointment with ${item.docData?.name ?? 'the doctor'}?`,
            [
                { text: 'No, Keep It', style: 'cancel' },
                {
                    text: 'Yes, Cancel', style: 'destructive',
                    onPress: async () => {
                        setCancellingId(apptId);
                        try {
                            // ✅ FIX: Use api instance
                            const { data } = await api.post('/api/user/cancel', { appointmentId: apptId });
                            if (data.success) {
                                queryClient.invalidateQueries({ queryKey: ['doctorById', item.doctorId] });
                                Alert.alert("✅ Cancelled", data.message);
                                getUserAppointments();
                            } else {
                                Alert.alert("Error", data.message);
                            }
                        } catch (error) { Alert.alert("Error", "Cancellation failed"); }
                        setCancellingId(null);
                    }
                }
            ]
        );
    };

    const openAppointment = (item) => {
        const apptId = item.id ?? item._id;
        markAsRead(apptId);
        router.push({ pathname: '/(patient)/view-appointment', params: { appointmentId: apptId } });
    };

    useFocusEffect(
        useCallback(() => {
            if (token) {
                getUserAppointments();
            }
        }, [token])
    );

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>
                {/* HEADER */}
                <View style={[styles.header, dynamicStyles.header]}>
                    <TouchableOpacity
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/(patient)/home');
                            }
                        }}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={dynamicStyles.backIconSize}
                            color={COLORS.PRIMARY}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>My Appointments</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: normalize(20) }}
                >
                    {appointments.length === 0 && (
                        <View style={styles.emptyBox}>
                            <Text style={dynamicStyles.emptyEmoji}>📋</Text>
                            <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No Appointments Yet</Text>
                            <Text style={[styles.emptySubText, dynamicStyles.emptySubText]}>Your booked appointments will appear here.</Text>
                        </View>
                    )}

                    {appointments.map((item, index) => {
                        const apptId = item.id ?? item._id;
                        const unread = unreadCounts[apptId] || 0;
                        const isCancelling = cancellingId === apptId;
                        const isPendingCash = item.paymentMethod === 'cash' && item.paymentStatus === 'pending' && !item.cancelled && !item.completed;

                        return (
                            <TouchableOpacity
                                key={apptId ?? index}
                                style={[
                                    styles.card,
                                    dynamicStyles.card,
                                    unread > 0 && styles.cardHighlight,
                                    isCancelling && { opacity: 0.6 }
                                ]}
                                activeOpacity={0.9}
                                onPress={() => openAppointment(item)}
                                disabled={isCancelling}
                            >
                                {/* ✅ Apply the dynamic unreadLine styles here */}
                                {unread > 0 && <View style={[styles.unreadLine, dynamicStyles.unreadLine]} />}

                                <View style={styles.cardRow}>
                                    {item.docData?.image ? (
                                        <Image source={{ uri: item.docData.image }} style={[styles.avatar, dynamicStyles.avatar]} />
                                    ) : (
                                        <View style={[styles.avatar, styles.avatarPlaceholder, dynamicStyles.avatar]}>
                                            <Text style={[styles.avatarPlaceholderText, dynamicStyles.avatarPlaceholder]}>Dr</Text>
                                        </View>
                                    )}

                                    <View style={[styles.infoContainer, dynamicStyles.infoContainer]}>
                                        <View style={styles.nameRow}>
                                            <Text style={[styles.name, dynamicStyles.name]} numberOfLines={1}>
                                                {item.docData?.name}
                                            </Text>
                                            {unread > 0 && <View style={[styles.dot, dynamicStyles.dot]} />}
                                        </View>

                                        <Text style={[styles.specialty, dynamicStyles.specialty]} numberOfLines={1}>
                                            {item.docData?.speciality}
                                        </Text>

                                        <View style={styles.metaRow}>
                                            <Text style={[styles.dateText, dynamicStyles.dateText]}>
                                                📅 {slotDateFormat(item.slotDate)}
                                            </Text>
                                            <Text style={[styles.dateText, dynamicStyles.dateText]}>
                                                🕐 {item.slotTime}
                                            </Text>
                                        </View>

                                        <View style={[styles.actionsRow, dynamicStyles.actionsRow]}>
                                            {item.cancelled ? (
                                                <View style={[styles.statusBadge, dynamicStyles.actionBtn, styles.statusCancel]}>
                                                    <Text style={[styles.statusText, dynamicStyles.actionText, { color: DANGER }]}>✕ Cancelled</Text>
                                                </View>
                                            ) : (item.isCompleted || item.completed) ? (
                                                <View style={[styles.statusBadge, dynamicStyles.actionBtn, styles.statusDone]}>
                                                    <Text style={[styles.statusText, dynamicStyles.actionText, { color: SUCCESS }]}>✓ Completed</Text>
                                                </View>
                                            ) : (
                                                <>
                                                    {isPendingCash && (
                                                        <TouchableOpacity
                                                            style={[styles.payBtn, dynamicStyles.actionBtn]}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                router.push({
                                                                    pathname: '/(common)/payment-screen',
                                                                    params: {
                                                                        doctorId: item.doctorId, appointmentId: apptId,
                                                                        amount: item.amount, slotDate: item.slotDate, slotTime: item.slotTime,
                                                                        doctorName: item.docData?.name, mode: 'update'
                                                                    }
                                                                });
                                                            }}
                                                        >
                                                            <Text style={[styles.payBtnText, dynamicStyles.actionText]}>💳 Pay Now</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                    <TouchableOpacity
                                                        style={[styles.cancelBtn, dynamicStyles.actionBtn]}
                                                        onPress={(e) => { e.stopPropagation(); cancelAppointment(item); }}
                                                        disabled={isCancelling}
                                                    >
                                                        {isCancelling
                                                            ? <ActivityIndicator size="small" color="#fff" />
                                                            : <Text style={[styles.cancelBtnText, dynamicStyles.actionText]}>✕ Cancel</Text>
                                                        }
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default MyAppointments;

// ─── Base Styles ────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: PAGE_BG },
    container: { flex: 1, backgroundColor: PAGE_BG }, // Light blue bg so white cards pop

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E8ECF8',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    headerTitle: { fontWeight: '600', color: TEXT_MAIN },
    backButton: { padding: 4 },

    emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyText: { fontWeight: '700', color: TEXT_MAIN },
    emptySubText: { color: TEXT_MUTED, textAlign: 'center' },

    card: {
        backgroundColor: '#fff',
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E5F5',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        // ❌ REMOVED: overflow: 'hidden' — This was causing the Android bug where contents disappear!
    },
    cardHighlight: {
        borderColor: PRIMARY,
        borderWidth: 1,           // Keep consistent with default card to prevent layout shift
        borderLeftWidth: 4,       // Accent left border
        shadowOpacity: 0.15,
        elevation: 6
    },
    unreadLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: PRIMARY
        // (borderRadius is applied dynamically above)
    },

    cardRow: { flexDirection: 'row', alignItems: 'center' },

    avatar: {
        backgroundColor: '#EEF1FF',
        borderWidth: 1,
        borderColor: '#E0E5F5'
    },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    avatarPlaceholderText: { color: TEXT_MUTED, fontWeight: '700' },

    infoContainer: {},
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontWeight: '700', color: TEXT_MAIN, flex: 1 },
    dot: { backgroundColor: PRIMARY },
    specialty: { color: TEXT_MUTED },
    metaRow: { flexDirection: 'row', gap: 12 },
    dateText: { color: TEXT_MAIN, fontWeight: '500' },

    actionsRow: { flexDirection: 'row' },
    payBtn: { flex: 1, backgroundColor: '#EEF1FF', borderWidth: 1, borderColor: PRIMARY, alignItems: 'center' },
    payBtnText: { color: PRIMARY, fontWeight: '700' },
    cancelBtn: { flex: 1, backgroundColor: DANGER, alignItems: 'center' },
    cancelBtnText: { color: '#fff', fontWeight: '700' },

    statusBadge: { alignItems: 'center', flex: 1 },
    statusCancel: { backgroundColor: '#FFF0F7', borderWidth: 1, borderColor: '#FFB3D9' },
    statusDone: { backgroundColor: '#EAFAF0', borderWidth: 1, borderColor: '#B7F5CC' },
    statusText: { fontWeight: '700' },
});