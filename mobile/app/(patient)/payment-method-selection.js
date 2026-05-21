import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/Color';
import { createAppointment } from '../../src/api/appointment';
import { AuthContext } from '../../src/context/AuthContext';
import { scheduleAppointmentReminder } from '../../src/utils/notificationHelper';
import ConfirmationModal from '../../src/components/ConfirmationModal';

const PaymentMethodSelection = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { token } = useContext(AuthContext);

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ NEW: Loading state for online flow

    const handleMethod = async (method) => {
        if (method === 'online') {
            setLoading(true);
            try {
                const reminderMinutes = parseInt(params.reminder || '0');

                // ✅ FIX: CREATE APPOINTMENT FIRST (As 'pending') to lock the slot!
                const res = await createAppointment({
                    doctorId: params.doctorId,
                    slotDate: params.slotDate,
                    slotTime: params.slotTime,
                    token: token,
                    paymentMethod: 'online',
                    paymentStatus: 'pending', // ✅ CRITICAL: Not 'paid' yet!
                    reminderMinutes: reminderMinutes
                });

                if (res.success && res.appointmentId) {
                    // Slot is reserved! Now navigate to Stripe to pay.
                    router.push({
                        pathname: '/(common)/payment-screen',
                        params: {
                            appointmentId: res.appointmentId, // ✅ Pass the new ID
                            doctorId: params.doctorId,
                            amount: params.amount,
                            slotDate: params.slotDate,
                            slotTime: params.slotTime,
                            doctorName: params.doctorName,
                            mode: 'book',
                            reminder: params.reminder
                        }
                    });
                } else {
                    Alert.alert("Booking Failed", res.message || "Could not reserve the slot. It may have just been taken.");
                }
            } catch (error) {
                Alert.alert("Error", error.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        } else {
            // CASH FLOW (Remains unchanged - creates appointment as pending/cash)
            try {
                const reminderMinutes = parseInt(params.reminder || '0');
                const res = await createAppointment({
                    doctorId: params.doctorId,
                    slotDate: params.slotDate,
                    slotTime: params.slotTime,
                    token: token,
                    paymentMethod: 'cash',
                    paymentStatus: 'pending',
                    reminderMinutes: reminderMinutes
                });

                if (res.success) {
                    scheduleAppointmentReminder({
                        slotDate: params.slotDate,
                        slotTime: params.slotTime,
                        reminderMinutes: reminderMinutes,
                        id: 'local-' + Date.now()
                    });

                    setModalData({
                        doctorName: params.doctorName,
                        date: params.slotDate,
                        time: params.slotTime,
                        paymentMethod: 'cash',
                        paymentStatus: 'pending'
                    });
                    setShowModal(true);
                } else {
                    Alert.alert("Error", res.message || "Booking failed");
                }
            } catch (error) {
                Alert.alert("Error", error.message || "Something went wrong");
            }
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setTimeout(() => {
            router.replace('/(patient)/my-appointments');
        }, 300);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                {/* Header (Unchanged) */}
                <TouchableOpacity
                    style={styles.header}
                    onPress={() => {
                        if (router.canGoBack()) router.back();
                        else router.replace('/(patient)/home');
                    }}
                >
                    <Ionicons name="arrow-back-circle" size={36} color={COLORS.PRIMARY} />
                </TouchableOpacity>

                <Text style={styles.title}>Select Payment</Text>
                <Text style={styles.subtitle}>Complete your booking process</Text>

                {/* Summary Box (Unchanged) */}
                <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                        <Ionicons name="person-circle-outline" size={20} color={COLORS.PRIMARY} />
                        <Text style={styles.summaryText}>{params.doctorName}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.PRIMARY} />
                        <Text style={styles.summaryText}>{params.slotDate}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                        <Text style={styles.summaryText}>{params.slotTime}</Text>
                    </View>
                </View>

                {/* Online Option */}
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleMethod('online')}
                    activeOpacity={0.8}
                    disabled={loading} // ✅ Disable while reserving slot
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#EEF1FF' }]}>
                        {loading ? <ActivityIndicator color={COLORS.PRIMARY} /> : <Ionicons name="card-outline" size={24} color={COLORS.PRIMARY} />}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>Pay Online</Text>
                        <Text style={styles.cardSub}>{loading ? 'Reserving slot...' : 'Secure payment via Stripe'}</Text>
                    </View>
                    {!loading && <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />}
                </TouchableOpacity>

                {/* Cash Option */}
                <TouchableOpacity
                    style={[styles.card, styles.cashCard]}
                    onPress={() => handleMethod('cash')}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#FFFBEB' }]}>
                        <Ionicons name="cash-outline" size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>Pay at Hospital</Text>
                        <Text style={styles.cardSub}>Pay directly via cash</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>

            </View>

            <ConfirmationModal
                visible={showModal}
                onClose={handleModalClose}
                doctorName={modalData?.doctorName}
                date={modalData?.date}
                time={modalData?.time}
                paymentMethod={modalData?.paymentMethod}
                paymentStatus={modalData?.paymentStatus}
            />
        </SafeAreaView>
    );
};

export default PaymentMethodSelection;

// ─── Clean, Modern Styles (No normalize math) ──────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F8FAFC' // Very light modern gray
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        marginBottom: 25,
    },

    // ── Summary Box ─────────────────────────────────────────────
    summaryBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 5,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 15,
        gap: 12,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 47,
    },
    summaryText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#334155',
        flex: 1,
    },

    // ── Payment Cards ───────────────────────────────────────────
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        width: '100%',
        alignItems: 'center',
        padding: 18,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: COLORS.PRIMARY,
        ...Platform.select({
            ios: { shadowColor: COLORS.PRIMARY, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
            android: { elevation: 4 }
        })
    },
    cashCard: {
        borderColor: '#F59E0B',
        ...Platform.select({
            ios: { shadowColor: '#F59E0B', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
            android: { elevation: 4 }
        })
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14, // Squircle shape
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    cardSub: {
        fontSize: 13,
        color: '#888'
    },
});