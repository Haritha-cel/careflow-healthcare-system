import { StyleSheet, Text, TouchableOpacity, View, FlatList, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useState, useMemo } from 'react'
import { COLORS } from '../../src/styles/Color'
import SearchBar from '../../src/components/SearchBar'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { fetchDoctors } from '../../src/api/doctors'
import DoctorCard from '../../src/components/DoctorCard'

const Search = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);

    // ✅ Responsive Utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isTablet = Math.min(width, height) >= 600;

    // ✅ Dynamic Columns
    const numColumns = isTablet ? 3 : 2;

    const { data: doctors } = useQuery({
        queryKey: ['doctors'],
        queryFn: fetchDoctors
    });

    // Filter doctors by name or speciality
    const filteredDoctors = useMemo(() => {
        if (!searchText || !doctors) return [];
        return doctors.filter(d =>
            d.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            d.speciality?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, doctors]);

    const onChange = useCallback((text) => {
        setSearchText(text);
    }, []);

    const clearRecent = useCallback(() => {
        setRecentSearches([]);
    }, []);

    // ✅ Dynamic Styles
    const dynamicStyles = {
        searchContainer: {
            height: normalize(70),
        },
        subContainer: {
            paddingHorizontal: normalize(16),
            paddingVertical: normalize(12),
        },
        sectionTitle: {
            fontSize: normalize(15),
        },
        clearText: {
            fontSize: normalize(14),
        },
        recentListContainer: {
            paddingHorizontal: normalize(16),
            gap: normalize(10),
        },
        recentItem: {
            paddingVertical: normalize(12),
            paddingHorizontal: normalize(16),
            borderRadius: normalize(12),
        },
        recentItemText: {
            fontSize: normalize(14),
        },
        resultText: {
            fontSize: normalize(13),
            paddingHorizontal: normalize(16),
            marginTop: normalize(8),
        },
        emptyContainer: {
            marginTop: normalize(80),
        },
        emptyEmoji: {
            fontSize: normalize(48),
            marginBottom: normalize(12),
        },
        emptyText: {
            fontSize: normalize(15),
        },
        listContent: {
            padding: normalize(12),
            gap: normalize(16),
        },
        row: {
            gap: normalize(16),
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.container}>

                {/* Search Bar Header */}
                <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
                    <SearchBar onChange={onChange} />
                </View>

                {/* Recent Searches — only show if not typing */}
                {!searchText && (
                    <>
                        <View style={[styles.subContainer, dynamicStyles.subContainer]}>
                            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Recent Searches</Text>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity onPress={clearRecent}>
                                    <Text style={[styles.clearText, dynamicStyles.clearText]}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <View style={[styles.recentListContainer, dynamicStyles.recentListContainer]}>
                            {recentSearches.length === 0 ? (
                                <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
                                    <Text style={dynamicStyles.emptyEmoji}>🔍</Text>
                                    <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No recent searches</Text>
                                </View>
                            ) : (
                                recentSearches.map((item, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.recentItem, dynamicStyles.recentItem]}
                                        onPress={() => setSearchText(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.recentItemText, dynamicStyles.recentItemText]}>{item}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </>
                )}

                {/* Search Results */}
                {searchText.length > 0 && (
                    <>
                        <Text style={[styles.resultText, dynamicStyles.resultText]}>
                            {filteredDoctors.length} result{filteredDoctors.length !== 1 ? 's' : ''} for "{searchText}"
                        </Text>

                        {filteredDoctors.length === 0 ? (
                            <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
                                <Text style={dynamicStyles.emptyEmoji}>🩺</Text>
                                <Text style={[styles.emptyText, dynamicStyles.emptyText]}>No doctors found</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredDoctors}
                                keyExtractor={(item) => item.id}
                                numColumns={numColumns}
                                key={numColumns} // ✅ Prevents layout bugs on rotation/tablet
                                columnWrapperStyle={[styles.row, dynamicStyles.row]}
                                contentContainerStyle={[styles.listContent, dynamicStyles.listContent]}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <DoctorCard {...item} />
                                )}
                            />
                        )}
                    </>
                )}

            </View>
        </SafeAreaView>
    );
};

export default Search;

// ─── Base Styles (Layout, Colors Only) ─────────────────────────
const styles = StyleSheet.create({
    safe: { 
        flex: 1, 
        backgroundColor: '#F5F7FA' // Softer background
    },
    container: { 
        backgroundColor: '#F5F7FA' 
    },
    searchContainer: {
        backgroundColor: COLORS.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        // Subtle shadow to separate it from the list
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    subContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: { 
        fontWeight: '700', 
        color: '#1A1A2E' 
    },
    clearText: { 
        color: COLORS.PRIMARY, 
        fontWeight: '700' 
    },
    recentListContainer: {
        // gap handled dynamically
    },
    recentItem: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF8',
        // Shadow for cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    recentItemText: {
        color: '#1A1A2E',
        fontWeight: '500'
    },
    resultText: {
        color: '#7B7F9E',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#7B7F9E',
        fontWeight: '600'
    },
    row: {
        justifyContent: 'space-between',
    },
    listContent: {
        // padding and gap handled dynamically
    }
});