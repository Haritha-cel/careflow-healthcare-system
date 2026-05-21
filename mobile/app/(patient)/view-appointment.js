import {
    Image, ScrollView, StyleSheet, Text,
    View, ActivityIndicator, TouchableOpacity, useWindowDimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { COLORS } from '../../src/styles/Color';
import { fetchAppointmentById } from '../../src/api/appointment';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';

const ViewAppointment = () => {
    const { appointmentId } = useLocalSearchParams();
    const router = useRouter();
    const { token, user } = useContext(AuthContext);

    // ✅ Responsive Utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isSmallDevice = height < 700;
    const insets = useSafeAreaInsets(); // ✅ Fix bottom button overlap

    const [appointment, setAppointment] = useState(null);

    const { data: appointmentData, isLoading, error } = useQuery({
        queryKey: ['appointment', appointmentId],
        queryFn: () => fetchAppointmentById(appointmentId, token),
        enabled: !!appointmentId && !!token
    });

    useEffect(() => {
        if (appointmentData?.appointment) setAppointment(appointmentData.appointment);
    }, [appointmentData]);

    const doctorData = appointment?.docData;

    const slotDateFormat = (slotDate) => {
        if (!slotDate) return '';
        if (slotDate.includes('-')) {
            const [year, month, day] = slotDate.split('-');
            const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${day} ${months[Number(month)]} ${year}`;
        }
        return slotDate;
    };

    const isPendingCash = appointment?.paymentMethod === 'cash' && appointment?.paymentStatus === 'pending' && !appointment?.cancelled && !appointment?.completed;

    // ✅ Dynamic Status Styles Helper
    const getPaymentBadge = () => {
        if (appointment?.paymentStatus === 'paid') return { bg: '#EAFAF0', text: '#27ae60', label: '✓ Paid' };
        return { bg: '#FFF8E1', text: '#F57F17', label: '⏳ Pending' };
    };

    const getStatusBadge = () => {
        if (appointment?.cancelled) return { bg: '#FDEDEC', text: '#e53935', label: '✕ Cancelled' };
        if (appointment?.completed) return { bg: '#EAFAF0', text: '#27ae60', label: '✓ Completed' };
        return { bg: '#EEF1FF', text: COLORS.PRIMARY, label: '● Confirmed' };
    };

    // ✅ Dynamic Styles
    const dynamicStyles = {
        container: { padding: normalize(16), paddingBottom: normalize(160) },
        backBtn: { position: 'absolute', top: normalize(12), left: normalize(12), zIndex: 10, padding: normalize(8), borderRadius: normalize(20), backgroundColor: 'rgba(0,0,0,0.3)' },
        backIcon: { width: normalize(20), height: normalize(20) },

        bannerContainer: {
            height: isSmallDevice ? normalize(180) : normalize(220)
        },

        // ✅ ADD THESE THREE BACK:
        bannerOverlay: { height: normalize(80) },
        bannerName: { 
            fontSize: normalize(20), 
            bottom: normalize(40) // <-- This pushes the name down to the bottom!
        },
        bannerSpec: { 
            fontSize: normalize(13), 
            bottom: normalize(16) // <-- This pushes the speciality down!
        },

        section: { marginTop: normalize(16), padding: normalize(16), borderRadius: normalize(16) },
        sectionTitle: { fontSize: normalize(15), marginBottom: normalize(12) },
        infoRow: { paddingVertical: normalize(12), gap: normalize(10) },
        label: { fontSize: normalize(13) },
        value: { fontSize: normalize(14) },

        badgesRow: { marginTop: normalize(12), gap: normalize(10) },
        badge: { paddingVertical: normalize(8), paddingHorizontal: normalize(14), borderRadius: normalize(20) },
        badgeText: { fontSize: normalize(13) },

        aboutText: { fontSize: normalize(14), lineHeight: normalize(22) },

        bottom: { paddingBottom: normalize(16), paddingTop: normalize(16), paddingHorizontal: normalize(16), gap: normalize(10) },
        actionBtn: { paddingVertical: normalize(14), borderRadius: normalize(14) },
        actionText: { fontSize: normalize(15) },

        loadingText: { marginTop: normalize(10), fontSize: normalize(14) },
    };

    const openChat = () => {
        router.push({
            pathname: '/(common)/chat',
            params: {
                doctorId: appointment?.docId || appointment?.doctorId,
                appointmentId: appointmentId,
                userId: user?._id || user?.id,
                doctorName: doctorData?.name,
                doctorImage: doctorData?.image,
                isDoctor: 'false',
            }
        });
    };

    const openPayment = () => {
        router.push({
            pathname: '/(common)/payment-screen',
            params: {
                doctorId: appointment?.doctorId,
                appointmentId: appointmentId,
                amount: appointment?.amount,
                slotDate: appointment?.slotDate,
                slotTime: appointment?.slotTime,
                doctorName: doctorData?.name,
                mode: 'update',
            }
        });
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={{ color: 'red' }}>Failed to load appointment</Text>
            </View>
        );
    }

    const paymentBadge = getPaymentBadge();
    const statusBadge = getStatusBadge();

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView contentContainerStyle={[styles.container, dynamicStyles.container]} showsVerticalScrollIndicator={false}>

                {/* Doctor Header Banner */}
                {doctorData ? (
                    <View style={[styles.bannerContainer, dynamicStyles.bannerContainer]}>
                        <Image
                            source={{ uri: doctorData.image }}
                            style={[styles.bannerImage, dynamicStyles.bannerImage]}
                            resizeMode="cover"
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <View style={[styles.bannerOverlay, dynamicStyles.bannerOverlay]} />

                        {/* Back Button */}
                        <TouchableOpacity style={[styles.backBtn, dynamicStyles.backBtn]} onPress={() => router.back()}>
                            <Image source={require('../../src/assets/img/back.png')} style={[styles.backIcon, dynamicStyles.backIcon]} tintColor="#fff" />
                        </TouchableOpacity>

                        {/* Floating Text */}
                        <Text style={[styles.bannerName, dynamicStyles.bannerName]} numberOfLines={1}>{doctorData.name}</Text>
                        <Text style={[styles.bannerSpec, dynamicStyles.bannerSpec]} numberOfLines={1}>{doctorData.speciality}</Text>
                    </View>
                ) : (
                    <View style={styles.center}>
                        <Text style={styles.noData}>Doctor info not available</Text>
                    </View>
                )}

                {/* Details Card */}
                <View style={[styles.section, dynamicStyles.section]}>
                    <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Appointment Details</Text>

                    <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                        <Text style={[styles.label, dynamicStyles.label]}>📅 Date</Text>
                        <Text style={[styles.value, dynamicStyles.value]}>{slotDateFormat(appointment?.slotDate)}</Text>
                    </View>

                    <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                        <Text style={[styles.label, dynamicStyles.label]}>🕐 Time</Text>
                        <Text style={[styles.value, dynamicStyles.value]}>{appointment?.slotTime}</Text>
                    </View>

                    <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                        <Text style={[styles.label, dynamicStyles.label]}>💳 Method</Text>
                        <Text style={[styles.value, dynamicStyles.value]}>{appointment?.paymentMethod === 'online' ? 'Online' : 'Cash'}</Text>
                    </View>

                    {/* Status Badges Row */}
                    <View style={[styles.badgesRow, dynamicStyles.badgesRow]}>
                        <View style={[styles.badge, dynamicStyles.badge, { backgroundColor: paymentBadge.bg }]}>
                            <Text style={[styles.badgeText, dynamicStyles.badgeText, { color: paymentBadge.text }]}>
                                {paymentBadge.label}
                            </Text>
                        </View>
                        <View style={[styles.badge, dynamicStyles.badge, { backgroundColor: statusBadge.bg }]}>
                            <Text style={[styles.badgeText, dynamicStyles.badgeText, { color: statusBadge.text }]}>
                                {statusBadge.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* About Doctor */}
                {doctorData?.about && (
                    <View style={[styles.section, dynamicStyles.section]}>
                        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>About Doctor</Text>
                        <Text style={[styles.aboutText, dynamicStyles.aboutText]}>{doctorData.about}</Text>
                    </View>
                )}

            </ScrollView>

            {/* Floating Bottom Buttons */}
            {!appointment?.cancelled && (
                <View style={[styles.bottom, dynamicStyles.bottom]}>
                    {isPendingCash && (
                        <TouchableOpacity style={[styles.payBtn, dynamicStyles.actionBtn]} onPress={openPayment} activeOpacity={0.85}>
                            <Text style={[styles.payBtnText, dynamicStyles.actionText]}>💳  Pay Online</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.chatBtn, dynamicStyles.actionBtn]} onPress={openChat} activeOpacity={0.85}>
                        <Text style={[styles.chatBtnText, dynamicStyles.actionText]}>💬  Chat with Doctor</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default ViewAppointment;

// ─── Base Styles (Layout, Colors, No Hardcoded Sizes) ────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F7FA' },
    container: { backgroundColor: '#F5F7FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#666' },
    noData: { color: '#888', marginTop: 20 },

    // Modern Banner
    bannerContainer: { borderRadius: 20, overflow: 'hidden', marginBottom: 8 },
    bannerImage: { width: '100%', height: 280, resizeMode: 'cover' },
    bannerOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)'
    },
    backBtn: {},
    backIcon: {},
    bannerName: {
        position: 'absolute', left: 16, right: 16,
        color: '#fff', fontWeight: '700'
    },
    bannerSpec: {
        position: 'absolute', left: 16, right: 16,
        color: 'rgba(255,255,255,0.85)', fontWeight: '500'
    },

    // Details Section
    section: {
        backgroundColor: '#fff',
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 }, elevation: 2
    },
    sectionTitle: { fontWeight: '700', color: '#1A1A2E' },
    infoRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderColor: '#F0F0F5'
    },
    label: { color: '#7B7F9E', fontWeight: '500' },
    value: { color: '#1A1A2E', fontWeight: '600' },

    // Badges
    badgesRow: { flexDirection: 'row' },
    badge: { flex: 1, alignItems: 'center' },
    badgeText: { fontWeight: '700' },

    // About
    aboutText: { color: '#555' },

    // Bottom Buttons
    bottom: {
        position: 'absolute', bottom: 0, width: '100%',
        backgroundColor: '#fff',
        borderTopWidth: 1, borderColor: '#eee',
        flexDirection: 'row'
    },
    payBtn: {
        flex: 1,
        backgroundColor: '#EEF1FF',
        borderWidth: 1.5,
        borderColor: COLORS.PRIMARY,
        alignItems: 'center',
    },
    payBtnText: { color: COLORS.PRIMARY, fontWeight: '700' },
    chatBtn: {
        flex: 1,
        backgroundColor: COLORS.PRIMARY,
        alignItems: 'center',
    },
    chatBtnText: { color: '#fff', fontWeight: '700' },
});