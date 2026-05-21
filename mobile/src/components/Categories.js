import { FlatList, StyleSheet, Text, Pressable, View, Platform, Dimensions } from 'react-native'
import React, { useCallback, useState } from 'react'
import { speciality } from '../data/category'
import { COLORS } from '../styles/Color';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const Categories = ({ onChangeCategory }) => {    
    const [selected, setSelected] = useState(0);

    const onPress = useCallback((index) => {
        setSelected(index);
        const selectedCategory = speciality[index];
        onChangeCategory && onChangeCategory(selectedCategory.name);
    }, [onChangeCategory]);

    const RenderItem = ({ name, index }) => {
        const isSelected = index === selected;
        
        return (
            <Pressable 
                onPress={() => onPress(index)} 
                style={({ pressed }) => [
                    styles.categoryContainer, 
                    isSelected && styles.selectedContainer,
                    pressed && styles.pressedContainer
                ]}
            >
                <Text style={[styles.text, isSelected && styles.selectedText]}>
                    {name}
                </Text>
            </Pressable>
        )
    }

    return (
        <View style={styles.wrapper}>
            <FlatList
                data={speciality}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => <RenderItem {...item} index={index} key={index} />}
            />
        </View>
    )
}

export default Categories

const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 5,
    },
    listContent: {
        paddingHorizontal: isSmallDevice ? 16 : 20,
        gap: 10, 
    },
    
    // ── Unselected "Floating White Card" ────────────────────────
    categoryContainer: {
        backgroundColor: '#FFFFFF', 
        paddingVertical: isSmallDevice ? 12 : 14,
        paddingHorizontal: isSmallDevice ? 18 : 22,
        borderRadius: 14, 
        
        borderWidth: 1.5, 
        borderColor: '#E5E7EB', 
        
        ...Platform.select({
            ios: { 
                shadowColor: '#000', 
                shadowOffset: { width: 0, height: 3 }, 
                shadowOpacity: 0.08, 
                shadowRadius: 6 
            },
            android: { elevation: 4 }
        })
    },
    text: {
        fontSize: isSmallDevice ? 13 : 14,
        color: '#374151', // Dark gray text
        fontWeight: '600',
    },

    // ── Selected "Primary Container" ────────────────────────────
    selectedContainer: {
        backgroundColor: COLORS.PRIMARY, // Primary background
        borderColor: COLORS.PRIMARY,     // Border matches background
        
        // Heavy shadow to make the primary block pop
        ...Platform.select({
            ios: { 
                shadowColor: COLORS.PRIMARY, 
                shadowOffset: { width: 0, height: 5 }, 
                shadowOpacity: 0.4, 
                shadowRadius: 10 
            },
            android: { elevation: 8 }
        })
    },
    selectedText: {
        color: '#D1D5DB', // Light gray text for contrast against the dark primary color
        fontWeight: '800',
    },

    // ── Press Effect ────────────────────────────────────────────
    pressedContainer: {
        transform: [{ scale: 0.96 }],
        opacity: 0.9,
    }
});