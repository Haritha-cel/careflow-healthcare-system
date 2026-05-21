import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, TextInput, Switch, StatusBar, Alert, ActivityIndicator,
  Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useContext, useState, useEffect } from 'react';
import { DoctorContext } from '../../src/context/DoctorContext';
import { useAppContext } from '../../src/context/AppProvider';
import api from '../../src/api/axiosInstance';

const { width: SCREEN_W } = Dimensions.get('window');
const isSmall = SCREEN_W < 380;
const isTablet = SCREEN_W >= 768;

// ─── Responsive Sizing Helper ──────────────────────────────────
const scale = (size) => {
  const ratio = isTablet ? 0.6 : isSmall ? 0.9 : 1;
  return Math.round(size * ratio);
};

// ─── Colors ────────────────────────────────────────────────────
const PRIMARY       = '#131c62';
const PRIMARY_LIGHT = '#EEF1FF';
const SUCCESS       = '#059669';
const SUCCESS_LIGHT = '#ECFDF5';
const DANGER        = '#EF4444';
const DANGER_LIGHT  = '#FEF2F2';
const WARNING       = '#F59E0B';
const WARNING_LIGHT = '#FFFBEB';
const TEXT_MAIN     = '#111827';
const TEXT_SEC      = '#374151';
const TEXT_MUTED    = '#9CA3AF';
const PAGE_BG      = '#F8FAFC';
const INPUT_BG     = '#F9FAFB';
const INPUT_BORDER = '#E5E7EB';

// ─── Styles (Moved to top so Icons can access) ─────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  scroll: { paddingHorizontal: scale(18), paddingBottom: 50, paddingTop: scale(10) },
  
  // Loading
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingRing: { 
    width: 64, height: 64, borderRadius: 32, backgroundColor: PRIMARY_LIGHT, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 4 
  },
  loadingText: { color: TEXT_MUTED, fontSize: scale(15), fontWeight: '600' },

  // Icon Wrapper
  iconWrap: { alignItems: 'center', justifyContent: 'center' },

  // Hero Card
  heroCard: {
    backgroundColor: '#FFFFFF', borderRadius: scale(24), padding: scale(20),
    flexDirection: 'row', alignItems: 'center', gap: scale(16), marginBottom: scale(18),
    shadowColor: PRIMARY, shadowOpacity: 0.08, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  heroDecor: {
    position: 'absolute', top: -30, right: -30, width: 120, height: 120,
    borderRadius: 60, backgroundColor: PRIMARY, opacity: 0.04,
  },
  heroAvatarBox: {
    position: 'relative', width: scale(90), height: scale(90),
  },
  heroImage: {
    width: '100%', height: '100%', borderRadius: scale(22),
    backgroundColor: PRIMARY_LIGHT, borderWidth: 3, borderColor: '#FFFFFF',
  },
  heroInfo: { flex: 1, justifyContent: 'center' },
  heroName: { fontSize: scale(22), fontWeight: '800', color: TEXT_MAIN, letterSpacing: -0.8 },
  heroSpeciality: { fontSize: scale(14), color: PRIMARY, fontWeight: '700', marginTop: 3 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  badge: { 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, 
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' 
  },
  degreeBadge: { backgroundColor: PRIMARY_LIGHT },
  degreeText: { fontSize: scale(11), fontWeight: '700', color: PRIMARY },
  expBadge: { backgroundColor: WARNING_LIGHT, borderColor: 'rgba(245,158,11,0.1)' },
  expText: { fontSize: scale(11), fontWeight: '700', color: WARNING },

  // Available Card
  availableCard: {
    backgroundColor: '#FFFFFF', borderRadius: scale(18), padding: scale(16),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: scale(18), borderWidth: 1,
  },
  availableLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  availableTextBlock: { flex: 1 },
  availableLabel: { fontSize: scale(14), fontWeight: '700', color: TEXT_MAIN },
  availableStatus: { fontSize: scale(12), color: TEXT_MUTED, marginTop: 2, fontWeight: '500' },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF', borderRadius: scale(18), padding: scale(18),
    marginBottom: scale(16), borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
    borderLeftWidth: 4,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: scale(14) },
  sectionBar: { width: 3, height: 16, borderRadius: 2, backgroundColor: PRIMARY },
  sectionLabel: { 
    fontSize: scale(12), color: TEXT_MUTED, fontWeight: '800', 
    textTransform: 'uppercase', letterSpacing: 1 
  },
  aboutText: { fontSize: scale(14), color: TEXT_SEC, lineHeight: scale(22), fontWeight: '500' },
  feesDisplay: { 
    flexDirection: 'row', alignItems: 'baseline', gap: 4 
  },
  feesCurrency: { fontSize: scale(16), fontWeight: '700', color: PRIMARY },
  feesValue: { fontSize: scale(28), fontWeight: '900', color: PRIMARY, letterSpacing: -1 },
  addressLine: { fontSize: scale(14), color: TEXT_SEC, lineHeight: scale(22), fontWeight: '500' },

  // Inputs
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG,
    borderWidth: 1.5, borderColor: INPUT_BORDER, borderRadius: scale(14),
    paddingHorizontal: scale(16), paddingVertical: scale(2), height: scale(52),
  },
  inputFocused: { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
  currencyPrefix: { fontSize: scale(16), fontWeight: '800', color: PRIMARY, marginRight: 8 },
  input: { 
    flex: 1, fontSize: scale(16), color: TEXT_MAIN, fontWeight: '600', 
    paddingVertical: scale(10) 
  },
  addressInputBox: {
    backgroundColor: INPUT_BG, borderWidth: 1.5, borderColor: INPUT_BORDER,
    borderRadius: scale(14), paddingHorizontal: scale(16), marginBottom: scale(10),
  },
  addressInput: { 
    fontSize: scale(14), color: TEXT_MAIN, fontWeight: '500', 
    paddingVertical: scale(14), lineHeight: scale(20) 
  },

  // Buttons
  btnRow: { flexDirection: 'row', gap: scale(12), marginTop: scale(8) },
  actionBtn: { 
    flex: 1, flexDirection: 'row', borderRadius: scale(16), paddingVertical: scale(16), 
    alignItems: 'center', justifyContent: 'center', gap: 10, 
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  editBtn: { backgroundColor: PRIMARY },
  editBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: scale(15) },
  saveBtn: { backgroundColor: SUCCESS },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: scale(15) },
  discardBtn: { 
    backgroundColor: DANGER_LIGHT, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.2)',
    shadowOpacity: 0, elevation: 0 
  },
  discardBtnText: { color: DANGER, fontWeight: '800', fontSize: scale(15) },
  btnDisabled: { opacity: 0.6 },
});

// ─── Custom SVG-style Icons ────────────────────────────────────
const CheckIcon = ({ size = 18, color = '#fff' }) => (
  <View style={[s.iconWrap, { width: size + 4, height: size + 4 }]}>
    <View style={{
      width: size * 0.55, height: size * 0.3,
      borderLeftWidth: size * 0.13, borderBottomWidth: size * 0.13,
      borderColor: color, transform: [
        { rotate: '-45deg' }, { translateY: -size * 0.05 }
      ]
    }} />
  </View>
);

const XIcon = ({ size = 18, color = '#fff' }) => (
  <View style={[s.iconWrap, { width: size + 4, height: size + 4 }]}>
    <View style={{
      position: 'absolute', width: size * 0.7, height: size * 0.13,
      backgroundColor: color, borderRadius: size * 0.06, transform: [{ rotate: '45deg' }]
    }} />
    <View style={{
      position: 'absolute', width: size * 0.7, height: size * 0.13,
      backgroundColor: color, borderRadius: size * 0.06, transform: [{ rotate: '-45deg' }]
    }} />
  </View>
);

const PencilIcon = ({ size = 18, color = '#fff' }) => (
  <View style={[s.iconWrap, { width: size + 2, height: size + 2 }]}>
    {/* Pencil body */}
    <View style={{
      width: size * 0.7, height: size * 0.25,
      backgroundColor: color, borderRadius: size * 0.05,
      transform: [{ rotate: '-45deg' }, { translateY: size * 0.1 }]
    }} />
    {/* Pencil tip */}
    <View style={{
      position: 'absolute', bottom: 0, left: size * 0.1,
      width: 0, height: 0,
      backgroundColor: 'transparent', borderStyle: 'solid',
      borderLeftWidth: size * 0.12, borderRightWidth: size * 0.12,
      borderBottomWidth: size * 0.18,
      borderLeftColor: 'transparent', borderRightColor: 'transparent',
      borderBottomColor: color, transform: [{ rotate: '-45deg' }]
    }} />
  </View>
);


// ─── Main Component ────────────────────────────────────────────
const DoctorProfile = () => {
  const {
    profileData, setProfileData,
    getProfileData, dToken, backendUrl
  } = useContext(DoctorContext);

  const { values } = useAppContext();
  const currency = values?.currency ?? '$';

  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData(dToken);
    }
  }, [dToken, profileData]);

  const updateProfile = async () => {
    if (!dToken) {
      Alert.alert('Error', 'Not authenticated. Please login again.');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        address: profileData.address,
        fees: parseFloat(profileData.fees),
        available: profileData.available ?? false,
      };

      // ✅ FIX: Use the secure api instance. No need for manual headers or fetch!
      const { data } = await api.post('/api/doctor/update-profile', updateData);

      if (data.success) {
        Alert.alert('Success', data.message ?? 'Profile updated!');
        setIsEdit(false);
        getProfileData(dToken); // Refresh profile data
      } else {
        Alert.alert('Error', data.message ?? 'Update failed');
      }
    } catch (err) {
      // Axios wraps errors in err.response
      const errorMsg = err.response?.data?.message || err.message || 'Something went wrong';
      Alert.alert('Error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!profileData) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loadingBox}>
          <View style={s.loadingRing}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
          <Text style={s.loadingText}>Loading Profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isAvailable = profileData.available ?? false;

  return (
    <SafeAreaView edges={['top']} style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        {/* ── Hero Card ──────────────────────────────────────── */}
        <View style={s.heroCard}>
          <View style={s.heroDecor} />
          <View style={s.heroAvatarBox}>
            <Image source={{ uri: profileData.image }} style={s.heroImage} />
          </View>
          <View style={s.heroInfo}>
            <Text style={s.heroName}>{profileData.name}</Text>
            <Text style={s.heroSpeciality}>{profileData.speciality}</Text>
            <View style={s.badgeRow}>
              <View style={[s.badge, s.degreeBadge]}>
                <Text style={s.degreeText}>{profileData.degree}</Text>
              </View>
              <View style={[s.badge, s.expBadge]}>
                <Text style={s.expText}>{profileData.experience}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Availability Toggle ────────────────────────────── */}
        <View style={[
          s.availableCard, 
          { 
            backgroundColor: isAvailable ? SUCCESS_LIGHT : DANGER_LIGHT,
            borderColor: isAvailable ? 'rgba(5,150,105,0.15)' : 'rgba(239,68,68,0.15)'
          }
        ]}>
          <View style={s.availableLeft}>
            <View style={[s.statusDot, { backgroundColor: isAvailable ? SUCCESS : DANGER }]} />
            <View style={s.availableTextBlock}>
              <Text style={s.availableLabel}>Availability</Text>
              <Text style={s.availableStatus}>
                {isAvailable ? 'Available for bookings' : 'Not accepting bookings'}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={(val) => {
              if (isEdit) setProfileData(prev => ({ ...prev, available: val }));
            }}
            trackColor={{ false: '#FCA5A5', true: '#6EE7B7' }}
            thumbColor={isAvailable ? SUCCESS : DANGER}
            disabled={!isEdit}
          />
        </View>

        {/* ── About Section ──────────────────────────────────── */}
        <View style={[s.sectionCard, { borderLeftColor: PRIMARY }]}>
          <View style={s.sectionHeader}>
            <View style={s.sectionBar} />
            <Text style={s.sectionLabel}>About</Text>
          </View>
          <Text style={s.aboutText}>{profileData.about}</Text>
        </View>

        {/* ── Fees Section ───────────────────────────────────── */}
        <View style={[s.sectionCard, { borderLeftColor: SUCCESS }]}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionBar, { backgroundColor: SUCCESS }]} />
            <Text style={s.sectionLabel}>Appointment Fee</Text>
          </View>
          {isEdit ? (
            <View style={s.inputBox}>
              <Text style={s.currencyPrefix}>{currency}</Text>
              <TextInput
                style={s.input}
                keyboardType="numeric"
                value={String(profileData.fees ?? '')}
                onChangeText={(val) => setProfileData(prev => ({ ...prev, fees: val }))}
                placeholderTextColor={TEXT_MUTED}
              />
            </View>
          ) : (
            <View style={s.feesDisplay}>
              <Text style={s.feesCurrency}>{currency}</Text>
              <Text style={s.feesValue}>{profileData.fees}</Text>
            </View>
          )}
        </View>

        {/* ── Address Section ────────────────────────────────── */}
        <View style={[s.sectionCard, { borderLeftColor: WARNING }]}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionBar, { backgroundColor: WARNING }]} />
            <Text style={s.sectionLabel}>Clinic Address</Text>
          </View>
          {isEdit ? (
            <View>
              <View style={s.addressInputBox}>
                <TextInput
                  style={s.addressInput}
                  value={profileData.address?.line1 ?? ''}
                  placeholder="Address line 1"
                  placeholderTextColor={TEXT_MUTED}
                  onChangeText={(val) =>
                    setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: val } }))
                  }
                />
              </View>
              <View style={s.addressInputBox}>
                <TextInput
                  style={s.addressInput}
                  value={profileData.address?.line2 ?? ''}
                  placeholder="Address line 2"
                  placeholderTextColor={TEXT_MUTED}
                  onChangeText={(val) =>
                    setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: val } }))
                  }
                />
              </View>
            </View>
          ) : (
            <View>
              <Text style={s.addressLine}>{profileData.address?.line1}</Text>
              {profileData.address?.line2 ? (
                <Text style={s.addressLine}>{profileData.address.line2}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* ── Action Buttons ─────────────────────────────────── */}
        <View style={s.btnRow}>
          {isEdit ? (
            <>
              <TouchableOpacity
                style={[s.actionBtn, s.discardBtn]}
                onPress={() => { setIsEdit(false); getProfileData(dToken); }}
                activeOpacity={0.6}
              >
                <XIcon size={16} color={DANGER} />
                <Text style={s.discardBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, s.saveBtn, saving && s.btnDisabled]}
                onPress={updateProfile}
                disabled={saving}
                activeOpacity={0.6}
              >
                <CheckIcon size={16} color="#FFFFFF" />
                <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[s.actionBtn, s.editBtn]}
              onPress={() => setIsEdit(true)}
              activeOpacity={0.6}
            >
              <PencilIcon size={16} color="#FFFFFF" />
              <Text style={s.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorProfile;