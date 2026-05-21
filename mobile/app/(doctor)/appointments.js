import {
  StyleSheet, Text, View, Image,
  FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Alert,
  Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { useDoctorContext } from '../../src/context/DoctorContext';
import { useAppContext } from '../../src/context/AppProvider';

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

// ─── Styles (Moved to top so Icons can access) ─────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  listContainer: { paddingHorizontal: scale(18), paddingBottom: 40 },
  
  // Header
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? scale(16) : scale(12), 
    paddingBottom: scale(20) 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitleBar: { width: 4, height: 24, borderRadius: 2, backgroundColor: PRIMARY },
  headerTitle: { fontSize: scale(24), fontWeight: '800', color: TEXT_MAIN, letterSpacing: -0.8 },
  countBadge: { 
    backgroundColor: PRIMARY, borderRadius: 14, 
    paddingHorizontal: 10, paddingVertical: 4, 
    flexDirection: 'row', alignItems: 'center', gap: 4
  },
  countText: { color: '#fff', fontSize: scale(13), fontWeight: '700' },

  // Icon Wrapper
  iconWrap: { alignItems: 'center', justifyContent: 'center' },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: scale(18), marginBottom: scale(16),
    overflow: 'hidden', position: 'relative',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 4,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  cardHighlight: { borderColor: PRIMARY, elevation: 6, shadowOpacity: 0.12 },
  cardStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
  },
  cardInner: {
    paddingVertical: scale(16), paddingLeft: scale(18), paddingRight: scale(16),
    marginLeft: 4,
  },

  // Processing
  processingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8, zIndex: 10,
  },
  processingText: { fontSize: scale(13), fontWeight: '700', color: PRIMARY },

  // Unread
  unreadBanner: { 
    backgroundColor: PRIMARY, paddingVertical: scale(6), 
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' 
  },
  unreadBannerText: { color: '#fff', fontSize: scale(12), fontWeight: '700', letterSpacing: 0.3 },

  // Top Row
  topRow: { flexDirection: 'row', alignItems: 'center', gap: scale(14), marginBottom: scale(14) },
  avatar: { 
    width: scale(52), height: scale(52), borderRadius: scale(26), 
    borderWidth: 2, borderColor: '#F1F5F9' 
  },
  avatarFallback: { 
    backgroundColor: PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(19,28,98,0.1)' 
  },
  avatarInitial: { fontSize: scale(20), fontWeight: '800', color: PRIMARY },
  nameBlock: { flex: 1, justifyContent: 'center' },
  patientName: { fontSize: scale(16), fontWeight: '700', color: TEXT_MAIN, letterSpacing: -0.3 },
  ageText: { fontSize: scale(13), color: TEXT_MUTED, marginTop: 2, fontWeight: '500' },
  paymentBadge: { 
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, 
    borderWidth: 1, alignItems: 'center', justifyContent: 'center' 
  },
  paymentOnline: { backgroundColor: PRIMARY_LIGHT, borderColor: 'rgba(19,28,98,0.2)' },
  paymentCash: { backgroundColor: WARNING_LIGHT, borderColor: 'rgba(245,158,11,0.2)' },
  paymentText: { fontSize: scale(11), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  paymentOnlineText: { color: PRIMARY },
  paymentCashText: { color: WARNING },

  // Divider
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: scale(14) },

  // Info Row
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scale(16) },
  infoItem: { flex: 1 },
  infoLabel: { 
    fontSize: scale(11), color: TEXT_MUTED, fontWeight: '700', marginBottom: 4, 
    textTransform: 'uppercase', letterSpacing: 0.8 
  },
  infoValue: { fontSize: scale(14), color: TEXT_MAIN, fontWeight: '600', lineHeight: scale(20) },
  feesBox: { 
    backgroundColor: PRIMARY_LIGHT, paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 8, alignSelf: 'flex-start' 
  },
  feesValue: { fontSize: scale(17), color: PRIMARY, fontWeight: '900' },

  // Chat Button
  chatBtn: { 
    backgroundColor: '#FFFFFF', borderRadius: scale(12), paddingVertical: scale(12), 
    alignItems: 'center', borderWidth: 1.5, borderColor: PRIMARY, 
    marginBottom: scale(14), flexDirection: 'row', justifyContent: 'center', gap: 8,
  },
  chatBtnText: { color: PRIMARY, fontWeight: '800', fontSize: scale(14), letterSpacing: 0.3 },

  // Action Row
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { 
    flex: 1, flexDirection: 'row', borderRadius: scale(12), paddingVertical: scale(12), 
    alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cancelBtn: { backgroundColor: DANGER_LIGHT, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.2)' },
  completeBtn: { backgroundColor: SUCCESS_LIGHT, borderWidth: 1.5, borderColor: 'rgba(5,150,105,0.2)' },
  actionBtnText: { fontSize: scale(13), fontWeight: '800', letterSpacing: 0.3 },
  cancelBtnText: { color: DANGER },
  completeBtnText: { color: SUCCESS },
  btnDisabled: { opacity: 0.4 },

  // Status Badge
  statusBadge: { 
    flex: 1, flexDirection: 'row', borderRadius: scale(12), paddingVertical: scale(12), 
    alignItems: 'center', justifyContent: 'center', gap: 6 
  },
  statusCancelled: { backgroundColor: DANGER_LIGHT, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.2)' },
  statusCompleted: { backgroundColor: SUCCESS_LIGHT, borderWidth: 1.5, borderColor: 'rgba(5,150,105,0.2)' },
  statusText: { fontSize: scale(13), fontWeight: '800', letterSpacing: 0.3 },

  // Empty State
  emptyBox: { alignItems: 'center', marginTop: scale(80) },
  emptyIconCircle: { 
    width: 70, height: 70, borderRadius: 35, backgroundColor: PRIMARY_LIGHT, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 16 
  },
  emptyIcon: { fontSize: 30 },
  emptyTitle: { fontSize: scale(18), fontWeight: '800', color: TEXT_MAIN, marginBottom: 4 },
  emptySub: { fontSize: scale(14), color: TEXT_MUTED, fontWeight: '500' },
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

const ChatBubbleIcon = () => (
  <View style={{ width: 18, height: 16, position: 'relative' }}>
    <View style={{ 
      width: 18, height: 13, backgroundColor: PRIMARY, borderRadius: 6, overflow: 'hidden' 
    }}>
      <View style={{ 
        position: 'absolute', top: 3, left: 3, width: 8, height: 2, 
        backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 
      }} />
      <View style={{ 
        position: 'absolute', top: 7, left: 3, width: 12, height: 2, 
        backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 1 
      }} />
    </View>
    <View style={{ 
      position: 'absolute', bottom: 0, left: 3, width: 0, height: 0,
      backgroundColor: 'transparent', borderStyle: 'solid',
      borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 5,
      borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: PRIMARY
    }} />
  </View>
);


// ─── Main Component ────────────────────────────────────────────
const DoctorAppointments = () => {
  const router = useRouter();
  const {
    dToken, appointments, getAppointments,
    completeAppointment, cancelAppointment,
    profileData, getProfileData,
  } = useDoctorContext();

  const { unreadCounts, markAsRead, values } = useAppContext();
  const currency = values?.currency ?? '$';

  const [loadingId, setLoadingId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const profileRef = useRef(profileData);
  useEffect(() => { profileRef.current = profileData; }, [profileData]);

  useEffect(() => {
    if (dToken) {
      getAppointments();
      if (!profileData) {
        setProfileLoading(true);
        getProfileData().finally(() => setProfileLoading(false));
      }
    }
  }, [dToken]);

  // ── Time validation ──────────────────────────────────────────
  const isAppointmentTime = (slotDate, slotTime) => {
    try {
      if (!slotDate) return true;
      let dateStr = slotDate;
      if (slotDate.includes('_')) {
        const [day, month, year] = slotDate.split('_');
        dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
      let hours = 0, minutes = 0;
      if (slotTime) {
        const timeStr = slotTime.trim().toUpperCase();
        const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3];
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
        }
      }
      const [year, month, day] = dateStr.split('-').map(Number);
      const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0);
      return new Date() >= appointmentDate;
    } catch (e) { return true; }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    return new Date().getFullYear() - new Date(dob).getFullYear();
  };

  const slotDateFormat = (date) => {
    if (!date || typeof date !== 'string') return date ?? '';
    if (date.includes('_')) {
      const [day, month, year] = date.split('_');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(month)-1]} ${day}, ${year}`;
    }
    return date;
  };

  const getDoctorIdFromToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded._id || decoded.userId || decoded.sub || null;
    } catch (e) { return null; }
  };

  // ── Open Chat ────────────────────────────────────────────────
  const openChat = async (item) => {
    const patientId = item.userId ?? item.userData?._id ?? item.userData?.id;
    let doctorId = profileRef.current?.id || profileRef.current?._id;

    if (!doctorId && dToken) doctorId = getDoctorIdFromToken(dToken);

    if (!doctorId) {
      setProfileLoading(true);
      try {
        await getProfileData();
        doctorId = profileRef.current?.id || profileRef.current?._id;
      } catch (e) { console.error('getProfileData error:', e); }
      setProfileLoading(false);
    }

    if (!doctorId) {
      Alert.alert('Profile Error', 'Could not load doctor ID. Please restart the app.');
      return;
    }
    if (!patientId) {
      Alert.alert('Error', 'Patient ID not found.');
      return;
    }

    const apptId = item._id ?? item.id;
    markAsRead(apptId);

    const patientImage = item.userData?.image || null;
    const patientName = item.userData?.name || 'Patient';

    router.push({
      pathname: '/(common)/chat',
      params: {
        doctorId,
        userId: patientId,
        appointmentId: apptId,
        doctorName: profileRef.current?.name || 'Doctor',
        doctorImage: profileRef.current?.image || '',
        patientImage,
        patientName,
        isDoctor: 'true',
      }
    });
  };

  // ── Cancel ───────────────────────────────────────────────────
  const handleCancel = (item) => {
    const id = item._id ?? item.id;
    Alert.alert(
      'Cancel Appointment',
      `Cancel ${item.userData?.name ?? 'this patient'}'s appointment?\n\nDate: ${slotDateFormat(item.slotDate)}\nTime: ${item.slotTime}\n\nThis cannot be undone.`,
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel', style: 'destructive',
          onPress: async () => { setLoadingId(id); await cancelAppointment(id); setLoadingId(null); }
        }
      ]
    );
  };

  // ── Complete ─────────────────────────────────────────────────
  const handleComplete = (item) => {
    const id = item._id ?? item.id;
    if (!isAppointmentTime(item.slotDate, item.slotTime)) {
      Alert.alert(
        'Too Early',
        `This appointment is scheduled for ${slotDateFormat(item.slotDate)} at ${item.slotTime}.\n\nYou can only complete it after the appointment time.`
      );
      return;
    }
    Alert.alert(
      'Complete Appointment',
      `Mark ${item.userData?.name ?? 'this patient'}'s appointment as completed?\n\nDate: ${slotDateFormat(item.slotDate)}\nTime: ${item.slotTime}`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => { setLoadingId(id); await completeAppointment(id); setLoadingId(null); }
        }
      ]
    );
  };

  // ── Render card ──────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    const appointmentId = item._id ?? item.id;
    const isProcessing = loadingId === appointmentId;
    const unread = unreadCounts[appointmentId] || 0;
    const isCompleted = item.isCompleted || item.completed;

    const stripColor = item.cancelled ? DANGER : isCompleted ? SUCCESS : PRIMARY;

    return (
      <View style={[s.card, unread > 0 && s.cardHighlight]}>
        {/* Left Status Strip */}
        <View style={[s.cardStrip, { backgroundColor: stripColor }]} />

        {/* Unread Banner */}
        {unread > 0 && (
          <View style={s.unreadBanner}>
            <Text style={s.unreadBannerText}>
              💬 {unread} new message{unread > 1 ? 's' : ''} from patient
            </Text>
          </View>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <View style={s.processingOverlay}>
            <ActivityIndicator color={PRIMARY} size="small" />
            <Text style={s.processingText}>Processing…</Text>
          </View>
        )}

        <View style={s.cardInner}>
          {/* Top Row: Avatar + Info + Payment */}
          <View style={s.topRow}>
            {item.userData?.image ? (
              <Image source={{ uri: item.userData.image }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarFallback]}>
                <Text style={s.avatarInitial}>
                  {item.userData?.name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
            <View style={s.nameBlock}>
              <Text style={s.patientName}>{item.userData?.name ?? 'Unknown'}</Text>
              <Text style={s.ageText}>Age: {calculateAge(item.userData?.dob)}</Text>
            </View>
            <View style={[s.paymentBadge, item.payment ? s.paymentOnline : s.paymentCash]}>
              <Text style={[s.paymentText, item.payment ? s.paymentOnlineText : s.paymentCashText]}>
                {item.payment ? 'Online' : 'Cash'}
              </Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Info Row: Date & Fees */}
          <View style={s.infoRow}>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>📅 Date & Time</Text>
              <Text style={s.infoValue}>
                {slotDateFormat(item.slotDate)}{'\n'}{item.slotTime}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoLabel}>💰 Fees</Text>
              <View style={s.feesBox}>
                <Text style={s.feesValue}>{currency}{item.amount}</Text>
              </View>
            </View>
          </View>

          {/* Chat Button */}
          {!item.cancelled && (
            <TouchableOpacity
              style={s.chatBtn}
              onPress={() => openChat(item)}
              activeOpacity={0.7}
              disabled={profileLoading}
            >
              {profileLoading ? (
                <ActivityIndicator size="small" color={PRIMARY} />
              ) : (
                <>
                  <ChatBubbleIcon />
                  <Text style={s.chatBtnText}>Chat with Patient</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Action / Status Row */}
          {item.cancelled ? (
            <View style={[s.statusBadge, s.statusCancelled]}>
              <XIcon size={12} color={DANGER} />
              <Text style={[s.statusText, { color: DANGER }]}>Cancelled</Text>
            </View>
          ) : isCompleted ? (
            <View style={[s.statusBadge, s.statusCompleted]}>
              <CheckIcon size={12} color={SUCCESS} />
              <Text style={[s.statusText, { color: SUCCESS }]}>Completed</Text>
            </View>
          ) : (
            <View style={s.actionRow}>
              <TouchableOpacity
                style={[s.actionBtn, s.cancelBtn, isProcessing && s.btnDisabled]}
                onPress={() => handleCancel(item)}
                disabled={!!loadingId}
                activeOpacity={0.6}
              >
                <XIcon size={14} color={DANGER} />
                <Text style={[s.actionBtnText, s.cancelBtnText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.actionBtn, s.completeBtn, isProcessing && s.btnDisabled]}
                onPress={() => handleComplete(item)}
                disabled={!!loadingId}
                activeOpacity={0.6}
              >
                <CheckIcon size={14} color={SUCCESS} />
                <Text style={[s.actionBtnText, s.completeBtnText]}>Complete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <FlatList
        data={[...appointments].reverse()}
        keyExtractor={(item, index) => (item?._id ?? item?.id ?? index).toString()}
        renderItem={renderItem}
        contentContainerStyle={s.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={s.header}>
            <View style={s.headerLeft}>
              <View style={s.headerTitleBar} />
              <Text style={s.headerTitle}>Appointments</Text>
            </View>
            <View style={s.countBadge}>
              <Text style={s.countText}>{appointments.length}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <View style={s.emptyIconCircle}>
              <Text style={s.emptyIcon}>📋</Text>
            </View>
            <Text style={s.emptyTitle}>No Appointments</Text>
            <Text style={s.emptySub}>Your upcoming visits will show here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default DoctorAppointments;