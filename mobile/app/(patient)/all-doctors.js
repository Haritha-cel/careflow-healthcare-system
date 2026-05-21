import { 
    FlatList, 
    StyleSheet, 
    Text, 
    View,
    useWindowDimensions,
    TouchableOpacity // ✅ Added for icon wrapper
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { Ionicons } from '@expo/vector-icons' // ✅ Added for SVG Icon
import { useQuery } from '@tanstack/react-query'
import { fetchDoctors } from '../../src/api/doctors'
import DoctorCard from '../../src/components/DoctorCard'
import Button from '../../src/components/Button'
import { useRouter } from 'expo-router'
import { COLORS } from '../../src/styles/Color' // ✅ Added for icon color

const DoctorList = ({ horizontal }) => {
    const router = useRouter();
    
    // ✅ Responsive utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isTablet = Math.min(width, height) >= 600;

    // ✅ Dynamic number of columns based on device
    const numColumns = horizontal ? 1 : (isTablet ? 3 : 2);

    const { data, isLoading, error } = useQuery({
        queryKey: ['doctors'],
        queryFn: fetchDoctors
    });

    // ✅ Dynamic Styles
    const dynamicStyles = {
        container: {
            paddingHorizontal: normalize(12),
            paddingTop: normalize(8),
        },
        header: {
            height: normalize(60),
            marginBottom: normalize(10),
        },
        headerTitle: {
            fontSize: normalize(18),
            marginLeft: normalize(10),
        },
        backIconSize: normalize(28), // ✅ Changed from width/height to single size prop for SVG
        columnWrapper: {
            marginBottom: normalize(12),
        },
        listContent: {
            paddingBottom: normalize(20),
        },
        loadingText: {
            marginTop: normalize(30),
            fontSize: normalize(16),
        },
        errorText: {
            marginTop: normalize(30),
            fontSize: normalize(16),
        },
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading...</Text>
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <Text style={[styles.errorText, dynamicStyles.errorText]}>Error loading doctors</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={[styles.container, dynamicStyles.container]}>

                {!horizontal && (
                    <View style={[styles.header, dynamicStyles.header]}>
                        {/* ✅ NEW: Clean SVG Vector Icon replacing PNG */}
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name="arrow-back" 
                                size={dynamicStyles.backIconSize} 
                                color={COLORS.PRIMARY} 
                            />
                        </TouchableOpacity>

                        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>All Doctors</Text>
                    </View>
                )}

                <FlatList
                    data={data}
                    showsHorizontalScrollIndicator={false}
                    horizontal={horizontal}
                    numColumns={numColumns}
                    columnWrapperStyle={
                        !horizontal && [styles.columnWrapper, dynamicStyles.columnWrapper]
                    }
                    contentContainerStyle={[styles.listContent, dynamicStyles.listContent]}
                    keyExtractor={(item) => item.id}
                    key={numColumns} 
                    renderItem={({ item }) => (
                        <DoctorCard
                            horizontal={horizontal}
                            {...item}
                        />
                    )}
                />

            </View>
        </SafeAreaView>
    )
}

export default DoctorList

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        // Optional: Add padding if the tap area feels too small
        padding: 4, 
    },
    headerTitle: {
        fontWeight: '600',
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    listContent: {},
    loadingText: {
        textAlign: 'center',
    },
    errorText: {
        textAlign: 'center',
        color: 'red'
    }
});