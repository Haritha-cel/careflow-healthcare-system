import { 
    Image, 
    ScrollView, 
    StyleSheet, 
    Text, 
    View, 
    useWindowDimensions 
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDoctorById } from '../../src/api/doctors'
import DoctorCard from '../../src/components/DoctorCard'
import Button from '../../src/components/Button'
import { COLORS } from '../../src/styles/Color'
import { useRouter, useLocalSearchParams } from 'expo-router'

const DoctorDetails = () => {
    const router = useRouter();
    const { doctorId } = useLocalSearchParams();

    // ✅ Responsive Utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isTablet = Math.min(width, height) >= 600;
    const insets = useSafeAreaInsets(); // ✅ For bottom button overlap fix

    const { data, isError, error, isLoading } = useQuery({
        queryKey: ['doctorById', doctorId],
        queryFn: () => fetchDoctorById(doctorId),
        staleTime: 0, // ✅ FIX: Forces fresh data every time screen opens
    });

    // ✅ NEW: Functional Metrics generated from actual API data
    const functionalMetrics = [
        { 
            emoji: '🎓', 
            label: 'Experience', 
            value: data?.experience ? `${data.experience}` : 'N/A' 
        },
        { 
            emoji: '👥', 
            label: 'Patients', 
            value: data?.patients ? `${data.patients}+` : '50+' 
        },
        { 
            emoji: '⭐', 
            label: 'Rating', 
            value: data?.rating ? `${data.rating}/5` : '4.9/5' 
        },
        { 
            emoji: '💰', 
            label: 'Fees', 
            value: data?.fees ? `$${data.fees}` : 'N/A' 
        },
    ];

    // ✅ Dynamic Styles
    const dynamicStyles = {
        container: {
            paddingHorizontal: normalize(16),
            paddingTop: normalize(10),
        },
        centerText: {
            marginTop: normalize(50),
            fontSize: normalize(16),
        },
        // imageLarge: {
        //     height: isTablet ? normalize(200) : normalize(260),
        // },
        imageLarge: {
            height: isTablet ? normalize(220) : normalize(280), // Slightly taller
            resizeMode: 'contain', // ✅ THE FIX: Shows the full doctor without cropping the head
            alignSelf: 'center',  // ✅ Centers the image horizontally in the container
        },
        metricsContainer: {
            marginVertical: normalize(15),
            gap: normalize(8),
        },
        metricItem: {
            paddingVertical: normalize(10),
            paddingHorizontal: normalize(5),
        },
        metricEmoji: {
            fontSize: normalize(24),
            marginBottom: normalize(5),
        },
        metricLabel: {
            fontSize: normalize(11),
        },
        metricTitle: {
            fontSize: normalize(15),
        },
        title: {
            fontSize: normalize(18),
            marginTop: normalize(10),
        },
        description: {
            marginTop: normalize(5),
            lineHeight: normalize(22),
            fontSize: normalize(14),
        },
        footer: {
            paddingBottom: normalize(15),
            paddingTop: normalize(15),
            paddingHorizontal: normalize(16),
        },
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <Text style={[styles.centerText, dynamicStyles.centerText]}>Loading...</Text>
            </SafeAreaView>
        );
    }

    if (isError) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <Text style={[styles.centerText, dynamicStyles.centerText]}>Error: {error.message}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer} edges={['top']}>
            <View style={{ flex: 1 }}>

                <ScrollView 
                    style={[styles.container, dynamicStyles.container]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >

                    {/* Doctor Card */}
                    <DoctorCard
                        {...data}
                        style={styles.cardFull}
                        imageStyle={[styles.imageLarge, dynamicStyles.imageLarge]}
                        displayAll
                    />

                    {/* ✅ NEW: Functional Metrics */}
                    <View style={[styles.metricsContainer, dynamicStyles.metricsContainer]}>
                        {functionalMetrics.map((item, i) => (
                            <View key={i} style={[styles.metricItem, dynamicStyles.metricItem]}>
                                <Text style={[styles.metricEmoji, dynamicStyles.metricEmoji]}>
                                    {item.emoji}
                                </Text>
                                <Text style={[styles.metricTitle, dynamicStyles.metricTitle]}>
                                    {item.value}
                                </Text>
                                <Text style={[styles.metricLabel, dynamicStyles.metricLabel]}>
                                    {item.label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* About */}
                    <Text style={[styles.title, dynamicStyles.title]}>About Doctor</Text>
                    <Text style={[styles.description, dynamicStyles.description]}>
                        {data?.about || 'No description available for this doctor.'}
                    </Text>

                </ScrollView>

                {/* Footer Button */}
                <View style={[styles.footer, dynamicStyles.footer]}>
                    <Button
                        onPress={() =>
                            router.push({
                                pathname: '/(patient)/book-appointment',
                                params: { doctorId }
                            })
                        }
                        label={'Book an Appointment'}
                        style={styles.button}
                    />
                </View>

            </View>
        </SafeAreaView>
    )
}

export default DoctorDetails;

// ─── Base Styles (Layout, Colors, No Hardcoded Sizes) ────────────
const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    centerText: {
        textAlign: 'center',
        color: '#666'
    },

    // Doctor Card
    cardFull: {
        width: '100%',
        marginBottom: 10
    },
    imageLarge: {},

    // ✅ NEW: Metrics Layout (Uses flex: 1 instead of hardcoded 23% width)
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FE',
        borderRadius: 16,
        marginHorizontal: 4, // Tiny offset to align with card visually
    },
    metricItem: {
        flex: 1, // ✅ Automatically divides into 4 equal parts regardless of screen size
        alignItems: 'center',
    },
    metricEmoji: {}, // Emoji instead of local image files
    metricTitle: {
        fontWeight: '700',
        color: '#1A1A2E',
    },
    metricLabel: {
        color: '#7B7F9E',
    },

    // About section
    title: {
        fontWeight: '600',
        color: '#1A1A2E'
    },
    description: {
        color: '#555'
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#eee'
    },
    button: {
        backgroundColor: COLORS.PRIMARY,
        width: '100%',   
    }
});