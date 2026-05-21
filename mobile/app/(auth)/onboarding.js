import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/styles/Color';
import { TouchableOpacity } from 'react-native';

const Onboarding = () => {
    const router = useRouter();
    
    // ✅ Use hook - updates on rotation/resize
    const { width, height } = useWindowDimensions();
    
    // ✅ Create responsive scaling utilities
    const scale = Math.min(width, height) / 375; // Base: iPhone SE
    const normalize = (size) => Math.round(size * scale);
    
    // ✅ Detect device type for fine-tuning
    const isSmallDevice = height < 700;
    const isTablet = Math.min(width, height) >= 600;

    // ✅ Dynamic styles based on dimensions
    const dynamicStyles = {
        circle1: {
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            top: -width * 0.2,
            right: -width * 0.2,
        },
        circle2: {
            width: width * 0.45,
            height: width * 0.45,
            borderRadius: width * 0.225,
            top: height * 0.15,
            left: -width * 0.15,
        },
        circle3: {
            width: width * 0.22,
            height: width * 0.22,
            borderRadius: width * 0.11,
            top: height * 0.32,
            right: width * 0.05,
        },
        circle4: {
            width: width * 0.15,
            height: width * 0.15,
            borderRadius: width * 0.075,
            top: height * 0.22,
            right: width * 0.25,
        },
        glowRing1: {
            width: width * 0.65,
            height: width * 0.65,
            borderRadius: width * 0.325,
        },
        glowRing2: {
            width: width * 0.5,
            height: width * 0.5,
            borderRadius: width * 0.25,
        },
        doctorImage: {
            width: isTablet ? width * 0.45 : width * 0.78,
            height: isSmallDevice ? height * 0.28 : (isTablet ? height * 0.35 : height * 0.35),
        },
        brandName: {
            fontSize: isTablet ? normalize(32) : normalize(28),
        },
        brandTagline: {
            fontSize: normalize(13),
        },
        card: {
            padding: isTablet ? width * 0.05 : width * 0.06,
            paddingBottom: isSmallDevice ? height * 0.015 : height * 0.025,
        },
        cardTitle: {
            fontSize: isTablet ? normalize(24) : normalize(22),
        },
        cardSubtitle: {
            fontSize: normalize(14),
            lineHeight: normalize(22),
        },
        pillText: {
            fontSize: normalize(11),
        },
        pill: {
            paddingHorizontal: normalize(10),
            paddingVertical: normalize(6),
        },
        gradientBtn: {
            paddingVertical: isSmallDevice ? normalize(14) : normalize(16),
        },
        gradientBtnText: {
            fontSize: normalize(16),
        },
        footerText: {
            fontSize: normalize(11),
        },
        pillsRow: {
            gap: normalize(6),
            marginBottom: normalize(12),
        },
        cardSubtitleMargin: {
            marginBottom: isSmallDevice ? normalize(16) : normalize(24),
        },
        footerMargin: {
            marginTop: isSmallDevice ? normalize(10) : normalize(16),
        },
    };

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient
                colors={[COLORS.PRIMARY, '#3b0070', '#7c3aed', '#a78bfa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.3, y: 1 }}
                style={styles.gradient}
            >
                {/* Decorative circles */}
                <View style={[styles.circle, dynamicStyles.circle1, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />
                <View style={[styles.circle, dynamicStyles.circle2, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
                <View style={[styles.circle, dynamicStyles.circle3, { backgroundColor: 'rgba(255,255,255,0.09)' }]} />
                <View style={[styles.circle, dynamicStyles.circle4, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />

                {/* Branding */}
                <View style={[styles.brandContainer, { paddingTop: isSmallDevice ? height * 0.02 : height * 0.04 }]}>
                    <Text style={[styles.brandName, dynamicStyles.brandName]}>CareFlow</Text>
                    <Text style={[styles.brandTagline, dynamicStyles.brandTagline]}>Your trusted health companion</Text>
                </View>

                {/* Doctor image */}
                <View style={styles.imageContainer}>
                    <View style={[styles.glowRing, dynamicStyles.glowRing1, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
                    <View style={[styles.glowRing, dynamicStyles.glowRing2, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
                    <Image
                        source={require('../../src/assets/img/lady-doctor.png')}
                        style={[styles.doctorImage, dynamicStyles.doctorImage]}
                        resizeMode="contain"
                    />
                </View>

                {/* Bottom card */}
                <View style={[styles.card, dynamicStyles.card]}>
                    <View style={[styles.pillsRow, dynamicStyles.pillsRow]}>
                        <View style={[styles.pill, dynamicStyles.pill]}>
                            <Text style={[styles.pillText, dynamicStyles.pillText]}>📅 Easy Booking</Text>
                        </View>
                        <View style={[styles.pill, dynamicStyles.pill]}>
                            <Text style={[styles.pillText, dynamicStyles.pillText]}>👨‍⚕️ Top Doctors</Text>
                        </View>
                        <View style={[styles.pill, dynamicStyles.pill]}>
                            <Text style={[styles.pillText, dynamicStyles.pillText]}>🔒 Secure</Text>
                        </View>
                    </View>

                    <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>Welcome to CareFlow</Text>
                    <Text style={[styles.cardSubtitle, dynamicStyles.cardSubtitle, dynamicStyles.cardSubtitleMargin]}>
                        Seamless medical care and wellness tracking at your fingertips.
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        activeOpacity={0.85}
                        style={styles.gradientBtnWrapper}
                    >
                        <LinearGradient
                            colors={[COLORS.PRIMARY, '#7c3aed']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.gradientBtn, dynamicStyles.gradientBtn]}
                        >
                            <Text style={[styles.gradientBtnText, dynamicStyles.gradientBtnText]}>Get Started →</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={[styles.footerText, dynamicStyles.footerText, dynamicStyles.footerMargin]}>
                        🔐 256-bit encrypted · Trusted by thousands
                    </Text>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default Onboarding;

const styles = StyleSheet.create({
    safe: { flex: 1 },
    gradient: { flex: 1 },
    circle: { position: 'absolute' },

    brandContainer: {
        alignItems: 'center',
        zIndex: 1,
    },
    brandName: {
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1,
    },
    brandTagline: {
        color: 'rgba(255,255,255,0.75)',
        marginTop: 4,
    },

    imageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    glowRing: {
        position: 'absolute',
    },
    doctorImage: {
        // Dimensions set dynamically
    },

    card: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },

    pillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    pill: {
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
    },
    pillText: {
        color: COLORS.PRIMARY,
        fontWeight: '600',
    },

    cardTitle: {
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardSubtitle: {
        color: '#94a3b8',
        textAlign: 'center',
    },

    gradientBtnWrapper: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 4,
        width: '100%',
    },
    gradientBtn: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBtnText: {
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    footerText: {
        textAlign: 'center',
        color: '#cbd5e1',
    },
});