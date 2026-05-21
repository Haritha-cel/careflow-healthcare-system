import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React, { useCallback } from 'react'
import { COLORS } from '../styles/Color';

const Chip = ({ name, index, onChange, selected, disabled, status, style }) => {

    const onPress = useCallback(() => {
        if (disabled) return; 
        onChange && onChange(index);
    }, [index, disabled]);

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            style={[
                styles.container,
                style, 
                index === selected && styles.selectedContainer, 
                status === 'past' && styles.pastContainer,
                status === 'booked' && styles.bookedContainer,
            ]}
        >
            <Text style={[
                styles.text,
                index === selected && styles.selectedText,
                status === 'past' && styles.pastText,
                status === 'booked' && styles.bookedText,
            ]}>
                {name}
            </Text>
        </TouchableOpacity>
    );
};

export default Chip;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F3F4F6', // ✅ Solid Neutral Light Gray (No purple tints)
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#D1D5DB', // ✅ Solid Dark Gray Border
        // ✅ REMOVED ALL SHADOWS: They are hiding your selected state on white backgrounds
        shadowOpacity: 0,
        elevation: 0,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563', // ✅ Neutral Dark Gray text (NO primary color here!)
    },
    
    // ── Selected (Pure Contrast) ──────────────
    selectedContainer: {
        backgroundColor: COLORS.PRIMARY, // 100% Solid Dark Navy
        borderColor: COLORS.PRIMARY,
        // ✅ NO SHADOWS. Just raw, brutal color contrast.
    },
    selectedText: {
        color: COLORS.SECONDARY, // Pure White
        fontWeight: '800', 
    },

    // ── Past ──────────────────────────────────────
    pastContainer: {
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
    },
    pastText: {
        color: '#9CA3AF',
        fontWeight: '400',
    },

    // ── Booked ────────────────────────────────────
    bookedContainer: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    bookedText: {
        color: '#DC2626',
        fontWeight: '600',
        textDecorationLine: 'line-through',
    }
});