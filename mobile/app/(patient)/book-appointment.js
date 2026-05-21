import { StyleSheet, Text, View, ActivityIndicator, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useContext, useState } from 'react' // ✅ Removed useEffect
import { useQuery } from '@tanstack/react-query';
import { COLORS } from '../../src/styles/Color';
import { fetchDoctorById } from '../../src/api/doctors';
import Button from '../../src/components/Button';
import AppointmentSlot from '../../src/components/AppointmentSlot';
import ConfirmationModal from '../../src/components/ConfirmationModal';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AuthContext } from '../../src/context/AuthContext';
import dayjs from 'dayjs';

const BookAppointment = () => {
    const { doctorId } = useLocalSearchParams();
    const router = useRouter();

    // ✅ FIX: Get token and user directly from Context. No local state needed.
    const { user, token } = useContext(AuthContext);

    // ✅ Responsive utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isSmallDevice = height < 700;
    const isTablet = Math.min(width, height) >= 600;

    // ✅ Dynamic Styles
    const dynamicStyles = {
        availBanner: { padding: normalize(12), gap: normalize(10) },
        availDot: { width: normalize(10), height: normalize(10), borderRadius: normalize(5) },
        availText: { fontSize: normalize(13) },
        centerContainer: { padding: normalize(20) },
        incompleteBox: { padding: normalize(20), borderRadius: normalize(16), gap: normalize(10), maxWidth: isTablet ? '70%' : '100%' },
        incompleteTitle: { fontSize: normalize(16) },
        incompleteText: { fontSize: normalize(13), lineHeight: normalize(20) },
        profileButton: { marginTop: normalize(5) },
        unavailBox: { padding: normalize(24), borderRadius: normalize(20), gap: normalize(12), maxWidth: isTablet ? '70%' : '100%' },
        unavailEmoji: { fontSize: isTablet ? normalize(40) : normalize(48) },
        unavailTitle: { fontSize: normalize(18) },
        unavailText: { fontSize: normalize(13), lineHeight: normalize(20) },
        backButton: { marginTop: normalize(4) },
        bottom: { padding: normalize(15) },
        errorText: { marginBottom: normalize(10), fontSize: normalize(13) },
    };

    // ❌ REMOVED: Local token/user state and the two useEffects. 
    // AuthContext already loads from SecureStore on app startup!

    const [appointmentDetails, setAppointmentDetails] = useState({
        slot: { time: null, date: dayjs().format('YYYY-MM-DD'), reminder: '15' },
        doctor: doctorId,
    });

    const [formError, setFormError] = useState('');

    const { data: doctorData, isLoading, refetch } = useQuery({
        queryKey: ['doctorById', doctorId],
        queryFn: () => fetchDoctorById(doctorId),
        enabled: !!doctorId,
        staleTime: 0
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // ✅ FIX: Use context `user` directly instead of local state
    const isProfileComplete = !!(user?.name && user?.phone && user?.gender);
    const isAvailable = doctorData?.available === true;

    const onPressBook = useCallback(() => {
        setFormError('');

        if (!token) {
            setFormError('Not authenticated. Please login again.');
            return;
        }
        if (!isAvailable) {
            setFormError('This doctor is not available for bookings.');
            return;
        }
        if (!appointmentDetails.slot?.time) {
            setFormError('Please select a time slot.');
            return;
        }

        router.push({
            pathname: '/(patient)/payment-method-selection',
            params: {
                doctorId: doctorId,
                slotDate: appointmentDetails.slot.date,
                slotTime: appointmentDetails.slot.time,
                doctorName: doctorData?.name,
                amount: doctorData?.fees,
                reminder: appointmentDetails.slot.reminder
            }
        });
    }, [appointmentDetails, token, isAvailable, doctorData, router, doctorId]);

    const onChangeHandler = (name, value) => {
        setAppointmentDetails(prev => ({
            ...prev,
            slot: { ...prev.slot, [name]: value }
        }));
    };

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>

                {/* Availability Banner */}
                <View style={[styles.availBanner, dynamicStyles.availBanner, isAvailable ? styles.availBannerGreen : styles.availBannerRed]}>
                    <View style={[styles.availDot, dynamicStyles.availDot, { backgroundColor: isAvailable ? '#2DC653' : '#F72585' }]} />
                    <Text style={[styles.availText, dynamicStyles.availText, { color: isAvailable ? '#1a5c2a' : '#8b0a3a' }]}>
                        {isAvailable ? 'Available — Accepting new appointments' : 'Unavailable — Not accepting bookings right now'}
                    </Text>
                </View>

                {!isProfileComplete ? (
                    <View style={[styles.centerContainer, dynamicStyles.centerContainer]}>
                        <View style={[styles.incompleteBox, dynamicStyles.incompleteBox]}>
                            <Text style={[styles.incompleteTitle, dynamicStyles.incompleteTitle]}>Complete Your Profile</Text>
                            <Text style={[styles.incompleteText, dynamicStyles.incompleteText]}>
                                Please update your name and contact details before booking an appointment.
                            </Text>
                            <Button label="Go to Profile" onPress={() => router.push('/(patient)/my-profile')} style={[styles.profileButton, dynamicStyles.profileButton]} />
                        </View>
                    </View>
                ) : !isAvailable ? (
                    <View style={[styles.centerContainer, dynamicStyles.centerContainer]}>
                        <View style={[styles.unavailBox, dynamicStyles.unavailBox]}>
                            <Text style={[styles.unavailEmoji, dynamicStyles.unavailEmoji]}>🩺</Text>
                            <Text style={[styles.unavailTitle, dynamicStyles.unavailTitle]}>Doctor Unavailable</Text>
                            <Text style={[styles.unavailText, dynamicStyles.unavailText]}>
                                {doctorData?.name} is not accepting appointments at the moment.
                            </Text>
                            <Button label="Find Another Doctor" onPress={() => router.back()} style={[styles.backButton, dynamicStyles.backButton]} />
                        </View>
                    </View>
                ) : (
                    <>
                        <AppointmentSlot onChangeHandler={onChangeHandler} bookedSlots={doctorData?.slots_booked || {}} />
                        <View style={[styles.bottom, dynamicStyles.bottom]}>
                            {formError ? <Text style={[styles.errorText, dynamicStyles.errorText]}>{formError}</Text> : null}
                            <Button onPress={onPressBook} label="Proceed to Payment" style={styles.button}
                                disabled={!appointmentDetails.slot?.time}  // ✅ ADD THIS
                                opacity={!appointmentDetails.slot?.time ? 0.5 : 1} />
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

export default BookAppointment;

// ─── Base Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    availBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', borderBottomWidth: 1, borderColor: '#FFE082' },
    availDot: {},
    availText: { fontWeight: '700', flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    incompleteBox: { backgroundColor: '#FFF3CD', borderWidth: 1, borderColor: '#FFCA28', alignItems: 'center', width: '100%' },
    incompleteTitle: { fontWeight: '700', color: '#856404' },
    incompleteText: { color: '#856404', textAlign: 'center' },
    profileButton: { backgroundColor: COLORS.PRIMARY, width: '100%' },
    unavailBox: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#FFB3D9', alignItems: 'center', width: '100%' },
    unavailEmoji: {},
    unavailTitle: { fontWeight: '800', color: '#1A1A2E' },
    unavailText: { color: '#7B7F9E', textAlign: 'center' },
    backButton: { backgroundColor: '#4361EE', width: '100%' },
    bottom: {},
    button: { backgroundColor: COLORS.PRIMARY, width: '100%' },
    errorText: { color: 'red', textAlign: 'center' }
});