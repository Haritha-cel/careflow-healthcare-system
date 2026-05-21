import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const DoctorCard = ({
    id,
    name,
    image,
    speciality,
    available,
    horizontal,
    style,
    imageStyle,
    displayAll,
    contentContainerStyle,
    ...props
}) => {
    const router = useRouter();
    
    // ✅ Responsive utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isSmallDevice = height < 700;
    const isTablet = Math.min(width, height) >= 600;

    // ✅ Dynamic Styles
    const dynamicStyles = {
        container: {
            // ✅ FIX 1: Narrower width prevents the "wide banner" look
            width: horizontal ? width * 0.42 : undefined,
            marginHorizontal: horizontal ? normalize(8) : normalize(4),
        },
        imageHeight: {
            // ✅ FIX 2: Use aspect ratio for horizontal instead of fixed height
            // This guarantees a perfect portrait shape (3 wide x 4 tall) without cropping heads
            height: horizontal 
                ? undefined 
                : (isSmallDevice ? normalize(150) : normalize(220)),
            aspectRatio: horizontal ? 3 / 4 : undefined, 
        },
        badge: {
            bottom: normalize(7),
            left: normalize(6),
            gap: normalize(4),
            paddingHorizontal: normalize(8),
            paddingVertical: normalize(3),
            borderRadius: normalize(20),
            shadowRadius: normalize(4),
        },
        dot: {
            width: normalize(6),
            height: normalize(6),
            borderRadius: normalize(3),
        },
        badgeText: {
            fontSize: normalize(10),
        },
        infoContainer: {
            padding: normalize(5),
        },
        nameText: {
            fontSize: normalize(16),
            width: isTablet ? '80%' : '70%',
        },
        ratingRow: {
            gap: normalize(2),
        },
        detailsRow: {
            flexDirection: 'row',
            paddingVertical: normalize(5),
            paddingRight: normalize(10),
        },
        starIcon: {
            width: normalize(14),
            height: normalize(14),
        },
        subText: {
            fontSize: normalize(12),
        }
    };

    return (
        <TouchableOpacity
            onPress={() => {
                if (!id) return;
                router.push({
                    pathname: '/(patient)/doctor-details',
                    params: { doctorId: id }
                });
            }}
            style={[styles.container, dynamicStyles.container, style]}
        >
            {/* Image + availability badge */}
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: image }}
                    style={[
                        styles.image,
                        dynamicStyles.imageHeight,
                        imageStyle
                    ]}
                />

                {/* Badge */}
                <View style={[
                    styles.badge,
                    dynamicStyles.badge,
                    available ? styles.badgeGreen : styles.badgeRed
                ]}>
                    <View style={[
                        styles.dot,
                        dynamicStyles.dot,
                        { backgroundColor: available ? '#2DC653' : '#F72585' }
                    ]} />
                    <Text style={[
                        styles.badgeText,
                        dynamicStyles.badgeText,
                        { color: available ? '#1a5c2a' : '#8b0a3a' }
                    ]}>
                        {available ? 'Available' : 'Unavailable'}
                    </Text>
                </View>
            </View>

            <View style={[
                styles.infoContainer,
                dynamicStyles.infoContainer,
                contentContainerStyle
            ]}>
                <Text style={[styles.nameText, dynamicStyles.nameText]} numberOfLines={1}>{name}</Text>

                <View style={[styles.ratingRow, dynamicStyles.ratingRow]}>
                    <Image 
                        source={require('../assets/img/star.png')} 
                        style={[styles.starIcon, dynamicStyles.starIcon]} 
                    />
                    <Text style={[styles.subText, dynamicStyles.subText]}>{props.rating}</Text>
                </View>

                <View style={[styles.detailsRow, dynamicStyles.detailsRow]}>
                    {displayAll && <Text style={[styles.subText, dynamicStyles.subText]}>{speciality}</Text>}
                    {!displayAll && <Text style={[styles.subText, dynamicStyles.subText]}>Fee ${props.fees}</Text>}
                </View>
            </View>

        </TouchableOpacity>
    )
}

export default DoctorCard

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        backgroundColor: '#fff',
        flex: 1, 
        overflow: 'hidden', // ✅ Ensures the aspect ratio image doesn't spill out of the rounded corners
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderWidth: 0.5,
        borderColor: '#dcdcdc',
        resizeMode: 'cover', 
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    badge: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.12,
    },
    badgeGreen: {
        backgroundColor: 'rgba(234,250,240,0.95)',
        borderWidth: 1,
        borderColor: '#B7F5CC',
    },
    badgeRed: {
        backgroundColor: 'rgba(255,240,247,0.95)',
        borderWidth: 1,
        borderColor: '#FFB3D9',
    },
    dot: {},
    badgeText: {
        fontWeight: '700',
    },
    nameText: {
        fontWeight: '600',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {},
    detailsRow: {},
    subText: {},
});