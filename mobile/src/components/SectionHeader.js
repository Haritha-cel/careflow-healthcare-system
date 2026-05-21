import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../styles/Color'

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const SectionHeader = ({ title, onPress }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>{title}</Text>
            
            {onPress && (
                <TouchableOpacity 
                    style={styles.buttonContainer} 
                    onPress={onPress}
                    activeOpacity={0.6}
                >
                    <Text style={styles.textButton}>See all</Text>
                    <Ionicons 
                        name="chevron-forward" 
                        size={isSmallDevice ? 16 : 18} 
                        color={COLORS.PRIMARY} 
                    />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default SectionHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: isSmallDevice ? 16 : 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    textTitle: {
        fontSize: isSmallDevice ? 17 : 19,
        fontWeight: '700',
        color: '#1E2937', // Dark slate color (Swap with COLORS.TEXT if you have it)
        letterSpacing: -0.2,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: -4, // Pulls the arrow closer to the text
    },
    textButton: {
        fontSize: isSmallDevice ? 13 : 14,
        fontWeight: '600',
        color: COLORS.PRIMARY,
        letterSpacing: 0.2,
    },
});