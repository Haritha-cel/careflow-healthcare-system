import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from "expo-linear-gradient";
import api from "../../src/api/axiosInstance";
import { AuthContext } from "../../src/context/AuthContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { COLORS } from "../../src/styles/Color";

const Profile = () => {
    const { user, setUser, token, fetchProfile } = useContext(AuthContext);

    // ✅ Responsive Utilities
    const { width, height } = useWindowDimensions();
    const scale = Math.min(width, height) / 375;
    const normalize = (size) => Math.round(size * scale);
    const isTablet = Math.min(width, height) >= 600;

    const [isEdit, setIsEdit] = useState(false);
    const [image, setImage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ✅ Dynamic Styles
    const dynamicStyles = {
        loadingText: { fontSize: normalize(15) },
        header: { paddingTop: normalize(30), paddingBottom: normalize(30) },
        circleTop: { top: -normalize(50), right: -normalize(50), width: normalize(180), height: normalize(180), borderRadius: normalize(90) },
        circleBottom: { bottom: -normalize(40), left: -normalize(40), width: normalize(150), height: normalize(150), borderRadius: normalize(75) },
        avatarWrapper: { marginBottom: normalize(12) },
        avatar: { width: normalize(100), height: normalize(100), borderRadius: normalize(50), borderWidth: 3 },
        avatarFallbackText: { fontSize: normalize(38) },
        cameraBadge: { borderRadius: normalize(12), padding: normalize(4) },
        cameraBadgeText: { fontSize: normalize(14) },
        removePhotoBtn: { marginTop: normalize(8), paddingVertical: normalize(4), paddingHorizontal: normalize(12), borderRadius: normalize(20) },
        removePhotoText: { fontSize: normalize(12) },
        headerName: { fontSize: normalize(22), marginBottom: normalize(2) },
        headerEmail: { fontSize: normalize(13), marginBottom: normalize(16) },
        statsRow: { paddingVertical: normalize(12), paddingHorizontal: normalize(20), gap: normalize(10), marginHorizontal: normalize(20), borderRadius: normalize(16) },
        statIcon: { fontSize: normalize(16), marginBottom: normalize(2) },
        statLabel: { fontSize: normalize(11) },
        
        // ✅ FIX 1: Force 100% width on phones, limit only on tablets
        card: { 
            margin: normalize(16), 
            padding: normalize(20), 
            borderRadius: normalize(20), 
            width: isTablet ? '80%' : '100%', 
            alignSelf: 'center' 
        },
        
        fieldRow: { marginBottom: normalize(18) },
        fieldLabelRow: { gap: normalize(6), marginBottom: normalize(6) },
        fieldIcon: { fontSize: normalize(14) },
        fieldLabel: { fontSize: normalize(12) },
        fieldValue: { fontSize: normalize(15), paddingLeft: normalize(4) },
        inputBox: { borderWidth: 1.5, borderRadius: normalize(10), padding: normalize(12), fontSize: normalize(15) },
        
        // ✅ FIX 2: Gender Pill Styles
        genderRow: { gap: normalize(10) },
        genderPill: { flex: 1, paddingVertical: normalize(12), borderRadius: normalize(10), borderWidth: 1.5 },
        genderPillText: { fontSize: normalize(14) },
        
        btnRow: { gap: normalize(10), marginTop: normalize(10) },
        discardBtn: { borderWidth: 1.5, borderRadius: normalize(12), padding: normalize(14) },
        discardText: { fontSize: normalize(15) },
        saveBtn: { borderRadius: normalize(12) },
        saveBtnGradient: { paddingVertical: normalize(14) },
        saveBtnText: { fontSize: normalize(15) },
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingBox}>
                    <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Loading profile…</Text>
                </View>
            </SafeAreaView>
        );
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
        if (!result.canceled) {
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 500 } }],
                { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
            );
            setImage(manipulatedImage);
        }
    };

    const updateProfile = async () => {
        try {
            const formData = new FormData();
            formData.append("name", user.name ?? '');
            formData.append("phone", user.phone ?? '');
            formData.append("address", JSON.stringify({ line1: user.address?.line1 ?? '', line2: user.address?.line2 ?? '' }));
            formData.append("gender", user.gender ?? '');
            formData.append("dob", user.dob ?? '');
            if (image) formData.append("image", { uri: image.uri, name: "profile.jpg", type: "image/jpeg" });

            // ✅ FIX: Use api instance. Let interceptor handle the Auth header!
            // const { data } = await api.post(
            //     '/api/user/update-profile',
            //     formData,
            //     { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (data) => data }
            // );

            // ✅ FIX: Removed transformRequest. Axios + React Native handle FormData automatically.
            // The interceptor will now correctly attach the Bearer token!
            const { data } = await api.post(
                '/api/user/update-profile',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (data.success) {
                await fetchProfile(); setIsEdit(false); setImage(null);
                Alert.alert("✅ Success", "Profile updated successfully!");
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (err) {
            Alert.alert("Error", err.message || "Update failed");
        }
    };

    const removeImage = async () => {
        Alert.alert("Remove Photo", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: async () => {
                try {
                    // ✅ FIX: Use api instance
                    const { data } = await api.delete('/api/user/remove-profile-image');
                    if (data.success) { await fetchProfile(); setImage(null); Alert.alert("Success", "Profile photo removed"); }
                } catch (err) { Alert.alert("Error", "Failed to remove photo"); }
            }}
        ]);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: normalize(30) }}>
                
                {/* HEADER GRADIENT */}
                <LinearGradient colors={[COLORS.PRIMARY, '#2563eb', '#60a5fa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, dynamicStyles.header]}>
                    <View style={[styles.circleTop, dynamicStyles.circleTop]} />
                    <View style={[styles.circleBottom, dynamicStyles.circleBottom]} />

                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={isEdit ? pickImage : null} style={[styles.avatarWrapper, dynamicStyles.avatarWrapper]}>
                            {image?.uri || user?.image ? (
                                <Image source={{ uri: image ? image.uri : user.image }} style={[styles.avatar, dynamicStyles.avatar]} />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback, dynamicStyles.avatar]}>
                                    <Text style={[styles.avatarFallbackText, dynamicStyles.avatarFallbackText]}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
                                </View>
                            )}
                            {isEdit && (
                                <View style={[styles.cameraBadge, dynamicStyles.cameraBadge]}>
                                    <Text style={[styles.cameraBadgeText, dynamicStyles.cameraBadgeText]}>📷</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {isEdit && (user?.image || image) && (
                            <TouchableOpacity onPress={removeImage} style={[styles.removePhotoBtn, dynamicStyles.removePhotoBtn]}>
                                <Text style={[styles.removePhotoText, dynamicStyles.removePhotoText]}>🗑 Remove Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={[styles.headerName, dynamicStyles.headerName]}>{user.name}</Text>
                    <Text style={[styles.headerEmail, dynamicStyles.headerEmail]}>{user.email}</Text>

                    <View style={[styles.statsRow, dynamicStyles.statsRow]}>
                        <View style={styles.statPill}>
                            <Text style={[styles.statIcon, dynamicStyles.statIcon]}>🩺</Text>
                            <Text style={[styles.statLabel, dynamicStyles.statLabel]}>{user.gender || 'N/A'}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statPill}>
                            <Text style={[styles.statIcon, dynamicStyles.statIcon]}>🎂</Text>
                            <Text style={[styles.statLabel, dynamicStyles.statLabel]}>{user.dob || 'N/A'}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statPill}>
                            <Text style={[styles.statIcon, dynamicStyles.statIcon]}>📞</Text>
                            <Text style={[styles.statLabel, dynamicStyles.statLabel]}>{user.phone || 'N/A'}</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* FORM CARD */}
                <View style={[styles.card, dynamicStyles.card]}>
                    <FieldRow label="Full Name" icon="👤" isEdit={isEdit} value={user.name ?? ''} onChangeText={(t) => setUser({ ...user, name: t })} placeholder="Your full name" dynamicStyles={dynamicStyles} />
                    <FieldRow label="Phone" icon="📞" isEdit={isEdit} value={user.phone ?? ''} onChangeText={(t) => setUser({ ...user, phone: t })} keyboardType="phone-pad" placeholder="Phone number" dynamicStyles={dynamicStyles} />
                    <FieldRow label="Address Line 1" icon="📍" isEdit={isEdit} value={user.address?.line1 ?? ''} onChangeText={(t) => setUser({ ...user, address: { ...user.address, line1: t } })} placeholder="Street address" dynamicStyles={dynamicStyles} />
                    <FieldRow label="Address Line 2" icon="🏘️" isEdit={isEdit} value={user.address?.line2 ?? ''} onChangeText={(t) => setUser({ ...user, address: { ...user.address, line2: t } })} placeholder="City, Province" dynamicStyles={dynamicStyles} />

                    {/* ✅ IMPROVED GENDER FIELD */}
                    <View style={[styles.fieldRow, dynamicStyles.fieldRow]}>
                        <View style={[styles.fieldLabelRow, dynamicStyles.fieldLabelRow]}>
                            <Text style={[styles.fieldIcon, dynamicStyles.fieldIcon]}>⚧️</Text>
                            <Text style={[styles.fieldLabel, dynamicStyles.fieldLabel]}>Gender</Text>
                        </View>
                        
                        {isEdit ? (
                            <View style={[styles.genderRow, dynamicStyles.genderRow]}>
                                {['Male', 'Female', 'Other'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[
                                            styles.genderPill, 
                                            dynamicStyles.genderPill,
                                            user.gender === g && styles.genderPillActive
                                        ]}
                                        onPress={() => setUser({ ...user, gender: g })}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.genderPillText, 
                                            dynamicStyles.genderPillText,
                                            user.gender === g && styles.genderPillTextActive
                                        ]}>
                                            {g === 'Male' ? '👨 Male' : g === 'Female' ? '👩 Female' : '🧑 Other'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.fieldValue, dynamicStyles.fieldValue]}>{user.gender || '—'}</Text>
                        )}
                    </View>

                    <View style={[styles.fieldRow, dynamicStyles.fieldRow]}>
                        <View style={[styles.fieldLabelRow, dynamicStyles.fieldLabelRow]}>
                            <Text style={[styles.fieldIcon, dynamicStyles.fieldIcon]}>🎂</Text>
                            <Text style={[styles.fieldLabel, dynamicStyles.fieldLabel]}>Date of Birth</Text>
                        </View>
                        {isEdit ? (
                            <>
                                <TouchableOpacity style={[styles.inputBox, dynamicStyles.inputBox]} onPress={() => setShowDatePicker(true)}>
                                    <Text style={{ color: user.dob ? '#333' : '#aaa' }}>{user.dob || 'Select date'}</Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker value={user.dob ? new Date(user.dob) : new Date()} mode="date" display="default" maximumDate={new Date()} minimumDate={new Date(1900, 0, 1)} onChange={(event, selectedDate) => { setShowDatePicker(false); if (selectedDate) setUser({ ...user, dob: dayjs(selectedDate).format('YYYY-MM-DD') }); }} />
                                )}
                            </>
                        ) : (
                            <Text style={[styles.fieldValue, dynamicStyles.fieldValue]}>{user.dob || '—'}</Text>
                        )}
                    </View>

                    <View style={[styles.btnRow, dynamicStyles.btnRow]}>
                        {isEdit && (
                            <TouchableOpacity style={[styles.discardBtn, dynamicStyles.discardBtn]} onPress={() => { setIsEdit(false); setImage(null); }}>
                                <Text style={[styles.discardText, dynamicStyles.discardText]}>Discard</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.saveBtn, dynamicStyles.saveBtn]} onPress={isEdit ? updateProfile : () => setIsEdit(true)}>
                            <LinearGradient colors={[COLORS.PRIMARY, '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.saveBtnGradient, dynamicStyles.saveBtnGradient]}>
                                <Text style={[styles.saveBtnText, dynamicStyles.saveBtnText]}>{isEdit ? '💾 Save Changes' : '✏️ Edit Profile'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const FieldRow = ({ label, icon, isEdit, value, onChangeText, placeholder, keyboardType, dynamicStyles }) => (
    <View style={[styles.fieldRow, dynamicStyles.fieldRow]}>
        <View style={[styles.fieldLabelRow, dynamicStyles.fieldLabelRow]}>
            <Text style={[styles.fieldIcon, dynamicStyles.fieldIcon]}>{icon}</Text>
            <Text style={[styles.fieldLabel, dynamicStyles.fieldLabel]}>{label}</Text>
        </View>
        {isEdit ? (
            <TextInput value={value} onChangeText={onChangeText} style={[styles.inputBox, dynamicStyles.inputBox]} placeholder={placeholder} keyboardType={keyboardType || 'default'} placeholderTextColor="#aaa" />
        ) : (
            <Text style={[styles.fieldValue, dynamicStyles.fieldValue]}>{value || '—'}</Text>
        )}
    </View>
);

export default Profile;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#f8fafc' },
    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingText: { color: '#888' },
    
    header: { alignItems: 'center', overflow: 'hidden' },
    circleTop: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)' },
    circleBottom: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.07)' },

    avatarWrapper: {},
    avatar: { borderColor: 'rgba(255,255,255,0.5)' },
    avatarFallback: { backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarFallbackText: { fontWeight: '700', color: '#fff' },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', elevation: 3 },
    
    removePhotoBtn: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    removePhotoText: { color: '#fff', fontWeight: '600' },

    headerName: { fontWeight: '700', color: '#fff' },
    headerEmail: { color: 'rgba(255,255,255,0.75)' },

    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)' },
    statPill: { alignItems: 'center', flex: 1 },
    statLabel: { color: 'rgba(255,255,255,0.9)', fontWeight: '600', textAlign: 'center' },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

    card: {
        backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 12, elevation: 4
    },

    fieldRow: {},
    fieldLabelRow: { flexDirection: 'row', alignItems: 'center' },
    fieldLabel: { fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    fieldValue: { color: '#1e293b' },

    inputBox: { borderColor: '#e2e8f0', color: '#1e293b', backgroundColor: '#f8fafc' },

    // ✅ NEW: Gender Pill Styles
    genderRow: { flexDirection: 'row' },
    genderPill: { 
        borderColor: '#e2e8f0', 
        backgroundColor: '#f8fafc', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    genderPillActive: { 
        borderColor: COLORS.PRIMARY, 
        backgroundColor: '#EEF1FF' 
    },
    genderPillText: { 
        color: '#64748b', 
        fontWeight: '600' 
    },
    genderPillTextActive: { 
        color: COLORS.PRIMARY 
    },

    btnRow: { flexDirection: 'row' },
    discardBtn: { flex: 1, borderColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
    discardText: { color: '#ef4444', fontWeight: '700' },
    saveBtn: { flex: 1, overflow: 'hidden' },
    saveBtnGradient: { alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700' }
});