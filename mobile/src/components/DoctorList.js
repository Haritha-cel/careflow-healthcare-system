import { FlatList, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDoctors } from '../api/doctors'
import DoctorCard from './DoctorCard'
import Button from './Button'
import { useRouter } from 'expo-router'

const DoctorList = ({ horizontal, selectedCategory }) => {
    const router = useRouter();

    // ✅ Responsive Utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isTablet = Math.min(width, height) >= 600;
    
    // ✅ Dynamic Columns
    const numColumns = horizontal ? 1 : (isTablet ? 3 : 2);

    const { data, isLoading, error } = useQuery({
        queryKey: ['doctors'],
        queryFn: fetchDoctors
    });

    // Filter by category
    const filteredDoctors = useMemo(() => {
        if (!data) return [];
        if (!selectedCategory || selectedCategory === '🩺 All') return data;

        const cleanCategory = selectedCategory.replace(/[^\w\s]/g, '').trim().toLowerCase();

        return data.filter(doctor => {
            const speciality = doctor.speciality?.toLowerCase() || '';
            return speciality.includes(cleanCategory) || cleanCategory.includes(speciality);
        });
    }, [data, selectedCategory]);

    // ✅ Dynamic Styles
    const dynamicStyles = {
        container: {
            padding: normalize(8),
        },
        header: {
            height: normalize(60),
        },
        backIcon: {
            width: normalize(24),
            height: normalize(24),
            resizeMode: 'contain',
        },
        noResult: {
            marginTop: normalize(20),
            fontSize: normalize(14),
        },
        listContent: {
            gap: normalize(16),
            // ✅ CRITICAL FIX: Prevents right edge clipping of fees/text in horizontal mode
            paddingRight: horizontal ? normalize(16) : 0, 
        },
        columnWrapper: {
            gap: normalize(16),
        }
    };

    if (isLoading) {
        return <Text style={{ textAlign: 'center', marginTop: normalize(20), fontSize: normalize(14) }}>Loading...</Text>
    }

    if (error) {
        return <Text style={{ textAlign: 'center', marginTop: normalize(20), color: 'red' }}>Error loading doctors</Text>
    }

    return (
        <View style={[styles.container, dynamicStyles.container]}>

            {!horizontal && (
                <View style={[styles.header, dynamicStyles.header]}>
                    <Button onPress={() => router.back()}>
                        <Image 
                            source={require('../assets/img/back.png')} 
                            style={dynamicStyles.backIcon} 
                        />
                    </Button>
                </View>
            )}

            {filteredDoctors.length === 0 && (
                <Text style={[styles.noResult, dynamicStyles.noResult]}>No doctors found for this category</Text>
            )}

            <FlatList
                data={filteredDoctors}
                showsHorizontalScrollIndicator={false}
                horizontal={horizontal}
                // ✅ ADD THIS: Forces the horizontal list to only take up the exact space it needs
                style={horizontal && { height: normalize(280) }} 
                numColumns={numColumns}
                key={numColumns} // ✅ Prevents layout bugs if columns ever change dynamically
                columnWrapperStyle={
                    !horizontal && [styles.columnWrapper, dynamicStyles.columnWrapper]
                }
                contentContainerStyle={[styles.listContent, dynamicStyles.listContent]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <DoctorCard
                        horizontal={horizontal}
                        {...item}
                    />
                )}
            />
        </View>
    )
}

export default DoctorList

// ─── Base Styles (Layout, Colors Only) ─────────────────────────
const styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center'
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    listContent: {
        // gap and paddingRight are handled dynamically
    },
    noResult: {
        textAlign: 'center',
        color: '#888'
    }
});