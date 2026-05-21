import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';
import { usePaymentSheet } from '@stripe/stripe-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../src/api/axiosInstance'; // ✅ FIX: Replaced raw axios with secure instance
import { AuthContext } from '../../src/context/AuthContext';
import { COLORS } from '../../src/styles/Color';
import ConfirmationModal from '../../src/components/ConfirmationModal';
import { scheduleAppointmentReminder } from '../../src/utils/notificationHelper'; // ✅ Import Helper

const PaymentScreen = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const { initPaymentSheet, presentPaymentSheet, loading } = usePaymentSheet();

    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isSmallDevice = height < 700;
    const isTablet = Math.min(width, height) >= 600;

    const [clientSecret, setClientSecret] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const dynamicStyles = {
        container: { padding: isTablet ? normalize(40) : normalize(20) },
        loadingText: { marginTop: normalize(10), fontSize: normalize(14) },
        card: { padding: isTablet ? normalize(40) : normalize(30), borderRadius: normalize(20), maxWidth: isTablet ? '60%' : '100%' },
        title: { fontSize: normalize(20), marginBottom: normalize(5) },
        subtitle: { fontSize: normalize(16), marginBottom: normalize(20) },
        amountContainer: { gap: normalize(2) },
        currency: { fontSize: normalize(24), marginRight: normalize(2) },
        amount: { fontSize: isTablet ? normalize(36) : normalize(40) },
        infoText: { fontSize: normalize(12), marginTop: normalize(10) },
        payButton: { marginTop: normalize(30), paddingVertical: isSmallDevice ? normalize(14) : normalize(16), paddingHorizontal: isTablet ? normalize(80) : normalize(60), borderRadius: normalize(30) },
        payText: { fontSize: normalize(18) },
    };

    // 1. Get Client Secret
    useEffect(() => {
        const fetchPaymentIntent = async () => {
            try {
                // ✅ FIX: Use secure api instance. Interceptor handles the Auth header automatically!
                const { data } = await api.post('/api/payment/create-intent', {
                    doctorId: params.doctorId,
                    appointmentId: params.appointmentId,
                    currency: 'usd'
                });
                setClientSecret(data.clientSecret);
            } catch (error) {
                console.log(error);
                Alert.alert("Error", "Failed to connect to payment server", [
                    {
                        text: "OK",
                        onPress: () => {
                            router.replace('/(patient)/my-appointments');
                        }
                    }
                ]);
            }
        };
        if (params.doctorId && params.appointmentId) fetchPaymentIntent();
    }, [params.doctorId, params.appointmentId]);

    // 2. Initialize Sheet (Unchanged)
    useEffect(() => {
        if (clientSecret) {
            const initialize = async () => {
                const { error } = await initPaymentSheet({
                    paymentIntentClientSecret: clientSecret,
                    merchantDisplayName: 'CareFlow Medical',
                });
                if (error) {
                    Alert.alert("Error", error.message);
                } else {
                    setIsReady(true);
                }
            };
            initialize();
        }
    }, [clientSecret]);

    // 3. Handle Pay Button
    const handlePay = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert("Payment Failed", error.message);
        } else {
            // ✅ Schedule local reminder notification
            if (params.reminder && params.slotDate && params.slotTime) {
                await scheduleAppointmentReminder({
                    slotDate: params.slotDate,
                    slotTime: params.slotTime,
                    reminderMinutes: parseInt(params.reminder),
                    id: params.appointmentId,
                });
            }

            setShowConfirmation(true);
        }
    };

    if (!clientSecret || !isReady) {
        return (
            <View style={[styles.container, dynamicStyles.container]}>
                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Preparing Payment...</Text>
            </View>
        );
    }

    // ✅ FIX: params.amount is in dollars (e.g., 50). Do not divide by 100 here.
    // Your backend converts it to cents (5000) for Stripe.
    const displayAmount = params.amount
        ? Number(params.amount).toFixed(2)
        : '0.00';

    return (
        <View style={[styles.container, dynamicStyles.container]}>
            <View style={[styles.card, dynamicStyles.card]}>
                <Text style={[styles.title, dynamicStyles.title]}>Confirm Payment</Text>
                <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
                    Appointment with {params.doctorName}
                </Text>

                <View style={[styles.amountContainer, dynamicStyles.amountContainer]}>
                    <Text style={[styles.currency, dynamicStyles.currency]}>$</Text>
                    <Text style={[styles.amount, dynamicStyles.amount]}>{displayAmount}</Text>
                </View>

                <Text style={[styles.infoText, dynamicStyles.infoText]}>
                    You will be charged after you confirm payment.
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.payButton,
                    dynamicStyles.payButton,
                    loading && styles.disabledButton
                ]}
                onPress={handlePay}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={[styles.payText, dynamicStyles.payText]}>Pay Now</Text>
                )}
            </TouchableOpacity>

            <ConfirmationModal
                visible={showConfirmation}
                onClose={() => {
                    setShowConfirmation(false);
                    // Navigate to appointments list to see the updated status
                    setTimeout(() => router.replace('/(patient)/my-appointments'), 300);
                }}
                doctorName={params.doctorName}
                date={params.slotDate}
                time={params.slotTime}
                paymentMethod="online"
                paymentStatus="paid"
            />
        </View>
    );
};

export default PaymentScreen;

// ─── Base Styles (Layout & Colors Only) ─────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: { color: '#666', fontWeight: '500' },
    card: { backgroundColor: '#fff', width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    title: { fontWeight: 'bold', color: '#1e293b' },
    subtitle: { color: '#666', textAlign: 'center' },
    amountContainer: { flexDirection: 'row', alignItems: 'baseline' },
    currency: { color: COLORS.PRIMARY, fontWeight: 'bold' },
    amount: { color: COLORS.PRIMARY, fontWeight: 'bold' },
    infoText: { color: '#888', textAlign: 'center' },
    payButton: { backgroundColor: COLORS.PRIMARY },
    disabledButton: { backgroundColor: '#ccc' },
    payText: { color: '#fff', fontWeight: 'bold' }
});