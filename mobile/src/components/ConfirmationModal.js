import { Modal, StyleSheet, Text, View, Animated, Dimensions, Platform } from 'react-native';
import React, { useCallback, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons'; // ✅ Using vector icons
import Button from './Button';
import { COLORS } from '../styles/Color';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const ConfirmationModal = ({ 
    visible, 
    onClose, 
    doctorName, 
    date, 
    time,
    paymentMethod, 
    paymentStatus 
}) => {
    const router = useRouter();
    
    // ✅ Animation Values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // ✅ Trigger pop-in animation when modal opens
    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }).start();
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Reset values when closing
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const onPress = useCallback(() => {
        if (onClose) onClose();
        
        // ✅ FIX: Webhook Race Condition
        // Delay navigation by 2 seconds to give the Stripe Webhook 
        // time to hit the backend and update MongoDB from "pending" to "paid".
        setTimeout(() => {
            router.replace('/(patient)/my-appointments');
        }, 2000); 
        
    }, [onClose, router]);

    const isPaid = paymentStatus === 'paid';

    const title = isPaid ? "Payment Successful!" : "Booking Confirmed!";
    const subtitle = isPaid 
        ? "Your payment was successful and your appointment is confirmed." 
        : "Your appointment has been booked successfully.";

    const statusBadge = isPaid 
        ? { text: "Paid Online", icon: "checkmark-circle", color: COLORS.SUCCESS || '#10B981' }
        : { text: "Pay at Hospital", icon: "cash-outline", color: "#F59E0B" };

    return (
        <Modal
            animationType="fade" // ✅ Let the internal animation handle the visual pop
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Animated.View 
                    style={[
                        styles.modalView, 
                        { 
                            transform: [{ scale: scaleAnim }], 
                            opacity: opacityAnim 
                        }
                    ]}
                >

                    {/* ✅ NEW: Custom Layered Success Icon */}
                    <View style={styles.iconWrapper}>
                        {/* Outer glow ring */}
                        <View style={[
                            styles.outerRing, 
                            { backgroundColor: isPaid ? '#D1FAE5' : COLORS.PRIMARY + '20' }
                        ]} />
                        {/* Inner solid circle */}
                        <View style={[
                            styles.innerCircle, 
                            { backgroundColor: isPaid ? '#10B981' : COLORS.PRIMARY }
                        ]}>
                            <Ionicons 
                                name="checkmark" 
                                size={isSmallDevice ? 35 : 42} 
                                color="white" 
                                style={{ marginTop: -2 }} // Optical centering for checkmarks
                            />
                        </View>
                    </View>

                    {/* Text Content */}
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* ✅ NEW: Clean Detail List (No Emojis) */}
                    <View style={styles.detailBox}>
                        <View style={styles.detailRow}>
                            <Ionicons name="person-circle-outline" size={20} color={COLORS.PRIMARY} />
                            <Text style={styles.detailText}>{doctorName}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.PRIMARY} />
                            <Text style={styles.detailText}>{date}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                            <Text style={styles.detailText}>{time}</Text>
                        </View>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: statusBadge.color + '15', borderColor: statusBadge.color + '30' }]}>
                        <Ionicons name={statusBadge.icon} size={16} color={statusBadge.color} />
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                        </Text>
                    </View>

                    {/* Action Button */}
                    <View style={styles.footer}>
                        <Button
                            onPress={onPress}
                            label={'View My Appointments'}
                            style={{ backgroundColor: COLORS.PRIMARY }}
                        />
                    </View>

                </Animated.View>
            </View>
        </Modal>
    );
};

export default ConfirmationModal;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent black overlay
    },
    modalView: {
        width: '88%',
        maxWidth: 400, // Prevents it from getting too wide on tablets
        backgroundColor: 'white',
        borderRadius: 28,
        paddingVertical: isSmallDevice ? 25 : 35,
        paddingHorizontal: isSmallDevice ? 20 : 25,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
            },
            android: {
                elevation: 15,
            }
        })
    },
    
    // ── Success Icon Styles ─────────────────────────────────────
    iconWrapper: {
        height: isSmallDevice ? 90 : 110,
        width: isSmallDevice ? 90 : 110,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    outerRing: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        borderRadius: 60,
    },
    innerCircle: {
        height: '75%',
        width: '75%',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        // Add subtle shadow to the circle itself
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
            android: { elevation: 6 }
        })
    },

    // ── Text Styles ─────────────────────────────────────────────
    title: { 
        fontSize: isSmallDevice ? 20 : 22, 
        fontWeight: '800', 
        color: '#1E293B', // Dark slate instead of primary for better readability
        marginBottom: 8,
        textAlign: 'center'
    },
    subtitle: { 
        fontSize: isSmallDevice ? 13 : 14, 
        color: '#64748B', // Modern gray
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        paddingHorizontal: 10,
    },

    // ── Detail Box Styles ───────────────────────────────────────
    detailBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        gap: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginLeft: 47, // Aligns with text start (15 padding + 20 icon + 12 gap)
    },
    detailText: { 
        fontSize: isSmallDevice ? 14 : 15, 
        fontWeight: '500', 
        color: '#334155',
        flex: 1, // Prevents text from spilling over if too long
    },

    // ── Status Badge Styles ─────────────────────────────────────
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 50,
        borderWidth: 1,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    
    // ── Footer ──────────────────────────────────────────────────
    footer: { 
        width: '100%', 
        marginTop: 5,
        paddingHorizontal: 10,
    }
});