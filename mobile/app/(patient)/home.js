import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useContext, useMemo, useState } from 'react'
import Header from '../../src/components/Header'
import Categories from '../../src/components/Categories'
import SectionHeader from '../../src/components/SectionHeader'
import DoctorList from '../../src/components/DoctorList'
import Button from '../../src/components/Button'
import { useFocusEffect, useRouter } from 'expo-router'
import { COLORS } from '../../src/styles/Color'
import { useQuery } from '@tanstack/react-query'
import { fetchDoctorById } from '../../src/api/doctors'
import { fetchSpecialities } from '../../src/api/specialities'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { AuthContext } from '../../src/context/AuthContext'
import api from '../../src/api/axiosInstance';

dayjs.extend(customParseFormat)

const formatTime = (time) => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${display}:${String(minute).padStart(2, '0')} ${period}`;
};

const Home = () => {
    const router = useRouter();
    const { token } = useContext(AuthContext); // ✅ Removed 'role' since this is strictly Patient Home

    // ✅ Responsive Utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);

    const [appointments, setAppointments] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('🩺 All');

    // ================= FETCH APPOINTMENTS =================
    const fetchUserAppointments = async () => {
        // if (!token) return; // Interceptor handles token existence
        try {
            // ✅ FIX: Use api instance. No need for manual headers or hardcoded URL!
            const response = await api.get('/api/user/appointments');
            if (response.data?.success) {
                setAppointments(response.data.appointments || []);
            } else {
                setAppointments([]);
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error?.response?.status || error.message);
            setAppointments([]);
        }
    };

    useFocusEffect(
    useCallback(() => {
        if (token) fetchUserAppointments();
    }, [token])
);

    // ================= NEAREST UPCOMING APPOINTMENT =================
    const currentAppointment = useMemo(() => {
        if (appointments.length === 0) return null;
        const now = new Date();

        const active = appointments.filter(a => {
            if (a.cancelled || a.completed) return false;
            try {
                let dateStr = a.slotDate;
                if (a.slotDate?.includes('_')) {
                    const [day, month, year] = a.slotDate.split('_');
                    dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                }
                let hours = 0, minutes = 0;
                if (a.slotTime) {
                    const timeStr = a.slotTime.trim().toUpperCase();
                    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
                    if (match) {
                        hours = parseInt(match[1]);
                        minutes = parseInt(match[2]);
                        const period = match[3];
                        if (period === 'PM' && hours !== 12) hours += 12;
                        if (period === 'AM' && hours === 12) hours = 0;
                    }
                }
                const [year, month, day] = dateStr.split('-').map(Number);
                const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0);
                return appointmentDate > now;
            } catch (e) { return true; }
        });

        if (active.length === 0) return null;
        const sorted = [...active].sort((a, b) => {
            const dtA = dayjs(`${a.slotDate} ${a.slotTime}`, 'YYYY-MM-DD hh:mm A');
            const dtB = dayjs(`${b.slotDate} ${b.slotTime}`, 'YYYY-MM-DD hh:mm A');
            return dtA.isBefore(dtB) ? -1 : 1;
        });
        return sorted[0];
    }, [appointments]);

    const doctorId = currentAppointment?.doctorId;

    const { data: doctorData } = useQuery({
        queryKey: ['doctorById', doctorId],
        queryFn: () => fetchDoctorById(doctorId),
        enabled: !!doctorId
    });

    const { data: specialityData } = useQuery({
        queryKey: ['specialities'],
        queryFn: fetchSpecialities
    });

    // ✅ Dynamic Styles
    const dynamicStyles = {
        mainPadding: { paddingHorizontal: normalize(16) },
        cardContainer: { padding: normalize(16), borderRadius: normalize(20), marginTop: normalize(10) },
        cardLabel: { fontSize: normalize(10), letterSpacing: normalize(1), marginBottom: normalize(12) },
        avatar: { width: normalize(56), height: normalize(56), borderRadius: normalize(28), marginRight: normalize(12) },
        avatarFallback: { fontSize: normalize(18) },
        doctorName: { fontSize: normalize(17), marginBottom: normalize(2) },
        doctorSpec: { fontSize: normalize(12), marginBottom: normalize(16) },
        footerRow: { gap: normalize(16) },
        infoBlock: { flexDirection: 'row', alignItems: 'center', gap: normalize(6) },
        infoIcon: { width: normalize(16), height: normalize(16) },
        infoText: { fontSize: normalize(13) },
        viewBtn: { paddingHorizontal: normalize(16), paddingVertical: normalize(8), borderRadius: normalize(20) },
        viewBtnText: { fontSize: normalize(12) },
        emptyContainer: { padding: normalize(24), borderRadius: normalize(20), marginTop: normalize(10), alignItems: 'center' },
        emptyEmoji: { fontSize: normalize(40), marginBottom: normalize(12) },
        emptyTitle: { fontSize: normalize(18), marginBottom: normalize(4) },
        emptySubText: { fontSize: normalize(13), marginBottom: normalize(20), textAlign: 'center', lineHeight: normalize(18) },
        findBtn: { paddingHorizontal: normalize(30), paddingVertical: normalize(10), borderRadius: normalize(25) },
    };

    return (
        <SafeAreaView style={styles.safeContainer} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Header />

                {/* ✅ Strictly Patient UI - Removed isDoctor check */}
                <View style={dynamicStyles.mainPadding}>
                    <Categories onChangeCategory={(cat) => setSelectedCategory(cat)} />

                    {currentAppointment ? (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push({
                                pathname: '/(patient)/view-appointment',
                                params: { appointmentId: currentAppointment.id }
                            })}
                            style={[styles.cardContainer, dynamicStyles.cardContainer]}
                        >
                            <Text style={[styles.cardLabel, dynamicStyles.cardLabel]}>UPCOMING APPOINTMENT</Text>
                            
                            <View style={styles.cardMainRow}>
                                {currentAppointment.docData?.image || doctorData?.image ? (
                                    <Image
                                        source={{ uri: currentAppointment.docData?.image || doctorData?.image }}
                                        style={[styles.avatar, dynamicStyles.avatar]}
                                    />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarFallback, dynamicStyles.avatar]}>
                                        <Text style={[styles.avatarFallbackText, dynamicStyles.avatarFallbackText]}>Dr</Text>
                                    </View>
                                )}
                                
                                <View style={styles.cardTextWrapper}>
                                    <Text style={[styles.doctorName, dynamicStyles.doctorName]}>
                                        {currentAppointment.docData?.name || doctorData?.name || 'Doctor'}
                                    </Text>
                                    <Text style={[styles.doctorSpec, dynamicStyles.doctorSpec]}>
                                        {currentAppointment.docData?.speciality || doctorData?.speciality || 'General Physician'}
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.cardFooter, dynamicStyles.footerRow]}>
                                <View style={[styles.infoBlock, dynamicStyles.infoBlock]}>
                                    <Image source={require('../../src/assets/img/calendar.png')} style={[styles.infoIcon, dynamicStyles.infoIcon]} />
                                    <Text style={[styles.infoText, dynamicStyles.infoText]}>
                                        {dayjs(currentAppointment?.slotDate).format('DD MMM YYYY')}
                                    </Text>
                                </View>
                                <View style={[styles.infoBlock, dynamicStyles.infoBlock]}>
                                    <Image source={require('../../src/assets/img/clock.png')} style={[styles.infoIcon, dynamicStyles.infoIcon]} />
                                    <Text style={[styles.infoText, dynamicStyles.infoText]}>
                                        {formatTime(currentAppointment?.slotTime)}
                                    </Text>
                                </View>
                                
                                <View style={[styles.viewBtn, dynamicStyles.viewBtn]}>
                                    <Text style={[styles.viewBtnText, dynamicStyles.viewBtnText]}>View →</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
                            <Text style={dynamicStyles.emptyEmoji}>🗓️</Text>
                            <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No Upcoming Appointments</Text>
                            <Text style={[styles.emptySubText, dynamicStyles.emptySubText]}>
                                You don't have any scheduled visits yet. Stay healthy and book a checkup today.
                            </Text>
                            <Button
                                label="Find Doctors"
                                onPress={() => router.push('/(patient)/all-doctors')}
                                style={[styles.findBtn, dynamicStyles.findBtn]}
                                textStyle={{ fontSize: normalize(14) }}
                            />
                        </View>
                    )}

                    <SectionHeader
                        title={'Top Doctors'}
                        onPress={() => router.push('/(patient)/all-doctors')}
                    />
                    <DoctorList horizontal selectedCategory={selectedCategory} />
                    
                    <View style={{ height: normalize(20) }} />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default Home;

// ─── Base Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#F5F7FA' },
    container: { backgroundColor: '#F5F7FA' },
    cardContainer: {
        backgroundColor: COLORS.PRIMARY,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    cardLabel: { color: 'rgba(255, 255, 255, 0.7)', fontWeight: '800', textTransform: 'uppercase' },
    cardMainRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
    avatarFallback: { alignItems: 'center', justifyContent: 'center' },
    avatarFallbackText: { color: '#fff', fontWeight: '700' },
    cardTextWrapper: { flex: 1, justifyContent: 'center' },
    doctorName: { color: '#FFFFFF', fontWeight: '700' },
    doctorSpec: { color: 'rgba(255, 255, 255, 0.8)' },
    cardFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.15)',
        paddingTop: 12, marginTop: 4,
    },
    infoBlock: {},
    infoIcon: { tintColor: 'rgba(255, 255, 255, 0.8)' },
    infoText: { color: '#FFFFFF', fontWeight: '500' },
    viewBtn: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    viewBtnText: { color: '#FFFFFF', fontWeight: '700' },
    emptyContainer: {
        backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    emptyTitle: { fontWeight: '700', color: '#1A1A2E' },
    emptySubText: { color: '#7B7F9E', width: '80%' },
    findBtn: { backgroundColor: COLORS.PRIMARY },
});