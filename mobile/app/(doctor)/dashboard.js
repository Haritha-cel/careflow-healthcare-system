import {
  StyleSheet, Text, View, Image,
  ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert,
  Dimensions, Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react'
import { useDoctorContext } from '../../src/context/DoctorContext'

const { width: SCREEN_W } = Dimensions.get('window')
const isSmall = SCREEN_W < 380
const isTablet = SCREEN_W >= 768

// ─── Responsive Sizing Helpers ─────────────────────────────────
const scale = (size) => {
  const ratio = isTablet ? 0.55 : isSmall ? 0.88 : 1
  return Math.round(size * ratio)
}

// ─── Colors (defined early so icons can use them if needed) ────
const PRIMARY       = '#131c62'
const PRIMARY_LIGHT = '#EEF1FF'
const SUCCESS       = '#059669'
const SUCCESS_LIGHT = '#ECFDF5'
const DANGER        = '#EF4444'
const DANGER_LIGHT  = '#FEF2F2'
const WARNING       = '#F59E0B'
const TEXT_MAIN     = '#111827'
const TEXT_SEC      = '#374151'
const TEXT_MUTED    = '#9CA3AF'
const PAGE_BG      = '#F8FAFC'

// ─── Styles ────────────────────────────────────────────────────
// Moved to the top so the Icon components can access `s`
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    paddingHorizontal: scale(18),
    paddingBottom: 40,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingRing: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: scale(15),
    fontWeight: '500',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? scale(16) : scale(12),
    paddingBottom: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: scale(14),
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: scale(26),
    fontWeight: '800',
    color: TEXT_MAIN,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SUCCESS_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(5,150,105,0.2)',
  },
  onlineDot: {
    width: 7, height: 7,
    borderRadius: 4,
    backgroundColor: SUCCESS,
  },
  headerBadgeText: {
    fontSize: scale(12),
    color: SUCCESS,
    fontWeight: '700',
  },
  statsGrid: {
    gap: scale(14),
    marginBottom: scale(28),
  },
  statBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    padding: scale(18),
    borderLeftWidth: 4,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statCornerDecor: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.07,
  },
  statTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  statIconBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  statMiniBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statMiniBadgeText: {
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statContent: {
    marginBottom: scale(10),
  },
  statValue: {
    fontSize: scale(28),
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: scale(34),
  },
  statLabel: {
    fontSize: scale(13),
    color: TEXT_MUTED,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.3,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBody: {
    width: 20, height: 14,
    backgroundColor: '#fff',
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  walletSlot: {
    position: 'absolute',
    right: 0, top: 4,
    width: 8, height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  walletClip: {
    position: 'absolute',
    top: -1, left: 5, right: 5,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
  },
  calTop: {
    width: 18, height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    marginBottom: 3,
  },
  calBody: {
    width: 18, height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  calDot: {
    width: 3, height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  calDotActive: {
    width: 3, height: 3,
    borderRadius: 1.5,
    backgroundColor: '#fff',
  },
  peopleCenter: {
    alignItems: 'center',
  },
  peopleHead: {
    width: 9, height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: 1,
  },
  peopleBody: {
    width: 16, height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  peopleSide: {
    position: 'absolute',
    top: 5,
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(16),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitleBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '800',
    color: TEXT_MAIN,
    letterSpacing: -0.3,
  },
  countPill: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  },
  countPillText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '700',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    marginBottom: scale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    position: 'relative',
  },
  bookingCardProcessing: {
    opacity: 0.65,
  },
  bookingStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  bookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(14),
    paddingLeft: scale(16),
    paddingRight: scale(14),
    marginLeft: 4,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    flex: 1,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    flexDirection: 'row',
    gap: 8,
    borderRadius: scale(16),
  },
  processingText: {
    fontSize: scale(12),
    color: PRIMARY,
    fontWeight: '600',
  },
  avatar: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
  },
  avatarFallback: {
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(19,28,98,0.1)',
  },
  avatarInitial: {
    fontSize: scale(18),
    fontWeight: '800',
    color: PRIMARY,
  },
  bookingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookingName: {
    fontSize: scale(15),
    fontWeight: '700',
    color: TEXT_MAIN,
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  bookingDateIcon: {
    fontSize: scale(10),
  },
  bookingDate: {
    fontSize: scale(12),
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  bookingRight: {
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusCancelled: {
    backgroundColor: DANGER_LIGHT,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  statusCancelledText: {
    color: DANGER,
    fontSize: scale(11),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusCompleted: {
    backgroundColor: SUCCESS_LIGHT,
    borderColor: 'rgba(5,150,105,0.2)',
  },
  statusCompletedText: {
    color: SUCCESS,
    fontSize: scale(11),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cancelBtn: {
    backgroundColor: DANGER_LIGHT,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  completeBtn: {
    backgroundColor: SUCCESS_LIGHT,
    borderWidth: 1.5,
    borderColor: 'rgba(5,150,105,0.25)',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: scale(40),
    backgroundColor: '#fff',
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 26,
  },
  emptyTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: scale(13),
    color: TEXT_MUTED,
    fontWeight: '500',
  },
})


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
)

const XIcon = ({ size = 18, color = '#fff' }) => (
  <View style={[s.iconWrap, { width: size + 4, height: size + 4 }]}>
    <View style={{
      position: 'absolute',
      width: size * 0.7, height: size * 0.13,
      backgroundColor: color, borderRadius: size * 0.06,
      transform: [{ rotate: '45deg' }]
    }} />
    <View style={{
      position: 'absolute',
      width: size * 0.7, height: size * 0.13,
      backgroundColor: color, borderRadius: size * 0.06,
      transform: [{ rotate: '-45deg' }]
    }} />
  </View>
)

const WalletIcon = () => (
  <View style={s.statIconCircle}>
    <View style={s.walletBody}>
      <View style={s.walletSlot} />
      <View style={s.walletClip} />
    </View>
  </View>
)

const CalendarIcon = () => (
  <View style={s.statIconCircle}>
    <View style={s.calTop} />
    <View style={s.calBody}>
      <View style={s.calDot} />
      <View style={s.calDot} />
      <View style={s.calDot} />
      <View style={s.calDotActive} />
    </View>
  </View>
)

const PeopleIcon = () => (
  <View style={s.statIconCircle}>
    <View style={s.peopleCenter}>
      <View style={s.peopleHead} />
      <View style={s.peopleBody} />
    </View>
    <View style={[s.peopleSide, { left: -6 }]}>
      <View style={[s.peopleHead, { width: 7, height: 7 }]} />
    </View>
    <View style={[s.peopleSide, { right: -6 }]}>
      <View style={[s.peopleHead, { width: 7, height: 7 }]} />
    </View>
  </View>
)


// ─── Helper ────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
}

// ─── Main Component ────────────────────────────────────────────
const DoctorDashboard = () => {
  const {
    dToken, dashData,
    getDashData,
    completeAppointment,
    cancelAppointment
  } = useDoctorContext()

  const currency = '$'
  const [loadingId, setLoadingId] = useState(null)

  const slotDateFormat = (date) => {
    if (!date || typeof date !== 'string') return date ?? ''
    if (date.includes('_')) {
      const [day, month, year] = date.split('_')
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return `${months[parseInt(month)-1]} ${day}, ${year}`
    }
    return date
  }

  useEffect(() => {
    if (dToken) getDashData(dToken);
  }, [dToken]);

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
    } catch (e) {
      return true;
    }
  };

  const handleCancel = (item) => {
    const id = item._id ?? item.id
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel ${item.userData?.name ?? 'this patient'}'s appointment on ${slotDateFormat(item.slotDate)}?\n\nThis cannot be undone.`,
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setLoadingId(id)
            await cancelAppointment(id)
            setLoadingId(null)
          }
        }
      ]
    )
  }

  const handleComplete = (item) => {
    const id = item._id ?? item.id
    if (!isAppointmentTime(item.slotDate, item.slotTime)) {
      Alert.alert(
        'Too Early',
        `This appointment is scheduled for ${slotDateFormat(item.slotDate)} at ${item.slotTime}.\n\nYou can only complete it after the appointment time.`
      );
      return;
    }
    Alert.alert(
      'Complete Appointment',
      `Mark ${item.userData?.name ?? 'this patient'}'s appointment as completed?\n\nEarnings will be updated.`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            setLoadingId(id)
            await completeAppointment(id)
            setLoadingId(null)
          }
        }
      ]
    )
  }

  if (!dashData) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loadingBox}>
          <View style={s.loadingRing}>
            <ActivityIndicator color={PRIMARY} size="large" />
          </View>
          <Text style={s.loadingText}>Loading your dashboard…</Text>
        </View>
      </SafeAreaView>
    )
  }

  const stats = [
    {
      label: 'Earnings',
      value: `${currency}${dashData.earnings}`,
      sub: 'Total Revenue',
      IconComp: WalletIcon,
      accent: '#131c62',
      gradient: ['#131c62', '#2a3aa0'],
      bgTint: 'rgba(19,28,98,0.08)',
    },
    {
      label: 'Appointments',
      value: dashData.appointments,
      sub: 'Total Bookings',
      IconComp: CalendarIcon,
      accent: '#7B2FBE',
      gradient: ['#7B2FBE', '#A855F7'],
      bgTint: 'rgba(123,47,190,0.08)',
    },
    {
      label: 'Patients',
      value: dashData.patients,
      sub: 'Unique Visits',
      IconComp: PeopleIcon,
      accent: '#059669',
      gradient: ['#059669', '#34D399'],
      bgTint: 'rgba(5,150,105,0.08)',
    },
  ]

  return (
    <SafeAreaView edges={['top']} style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ── Header ──────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerGreeting}>Good {getGreeting()} 👋</Text>
            <Text style={s.headerTitle}>Doctor Dashboard</Text>
          </View>
          <View style={s.headerBadge}>
            <View style={s.onlineDot} />
            <Text style={s.headerBadgeText}>Online</Text>
          </View>
        </View>

        {/* ── Stat Banners ────────────────────────────────────── */}
        <View style={s.statsGrid}>
          {stats.map((stat, i) => (
            <View key={stat.label} style={[s.statBanner, { borderLeftColor: stat.accent }]}>
              <View style={[s.statCornerDecor, { backgroundColor: stat.accent }]} />

              <View style={s.statTopRow}>
                <View style={[s.statIconBox, { backgroundColor: stat.accent }]}>
                  <stat.IconComp />
                </View>
                <View style={[s.statMiniBadge, { backgroundColor: stat.bgTint }]}>
                  <Text style={[s.statMiniBadgeText, { color: stat.accent }]}>{stat.sub}</Text>
                </View>
              </View>

              <View style={s.statContent}>
                <Text style={[s.statValue, { color: stat.accent }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>

              <View style={[s.statBottomBar, { backgroundColor: stat.accent }]} />
            </View>
          ))}
        </View>

        {/* ── Latest Bookings ─────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={s.sectionTitleRow}>
              <View style={s.sectionTitleBar} />
              <Text style={s.sectionTitle}>Latest Bookings</Text>
            </View>
            <View style={s.countPill}>
              <Text style={s.countPillText}>{dashData.latestAppointments.length}</Text>
            </View>
          </View>

          {dashData.latestAppointments.length === 0 ? (
            <View style={s.emptyBox}>
              <View style={s.emptyIconCircle}>
                <Text style={s.emptyIcon}>📋</Text>
              </View>
              <Text style={s.emptyTitle}>No Bookings Yet</Text>
              <Text style={s.emptySub}>New appointments will appear here</Text>
            </View>
          ) : (
            dashData.latestAppointments.map((item, index) => {
              const appointmentId = item._id ?? item.id
              const isProcessing = loadingId === appointmentId

              return (
                <View
                  key={appointmentId ?? index}
                  style={[s.bookingCard, isProcessing && s.bookingCardProcessing]}
                >
                  {isProcessing && (
                    <View style={s.processingOverlay}>
                      <ActivityIndicator color={PRIMARY} size="small" />
                      <Text style={s.processingText}>Updating…</Text>
                    </View>
                  )}

                  <View style={[
                    s.bookingStrip,
                    item.cancelled ? { backgroundColor: DANGER }
                    : (item.isCompleted || item.completed) ? { backgroundColor: SUCCESS }
                    : { backgroundColor: PRIMARY }
                  ]} />

                  <View style={s.bookingContent}>
                    <View style={s.bookingLeft}>
                      {item.userData?.image ? (
                        <Image source={{ uri: item.userData.image }} style={s.avatar} />
                      ) : (
                        <View style={[s.avatar, s.avatarFallback]}>
                          <Text style={s.avatarInitial}>
                            {item.userData?.name?.[0]?.toUpperCase() ?? '?'}
                          </Text>
                        </View>
                      )}

                      <View style={s.bookingInfo}>
                        <Text style={s.bookingName} numberOfLines={1}>
                          {item.userData?.name ?? 'Unknown'}
                        </Text>
                        <View style={s.bookingMeta}>
                          <Text style={s.bookingDateIcon}>📅</Text>
                          <Text style={s.bookingDate}>{slotDateFormat(item.slotDate)}</Text>
                          {item.slotTime ? (
                            <>
                              <Text style={s.bookingDateIcon}>🕐</Text>
                              <Text style={s.bookingDate}>{item.slotTime}</Text>
                            </>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    <View style={s.bookingRight}>
                      {item.cancelled ? (
                        <View style={[s.statusBadge, s.statusCancelled]}>
                          <XIcon size={10} color={DANGER} />
                          <Text style={s.statusCancelledText}>Cancelled</Text>
                        </View>
                      ) : (item.isCompleted || item.completed) ? (
                        <View style={[s.statusBadge, s.statusCompleted]}>
                          <CheckIcon size={10} color={SUCCESS} />
                          <Text style={s.statusCompletedText}>Completed</Text>
                        </View>
                      ) : (
                        <View style={s.actionBtns}>
                          <TouchableOpacity
                            style={[s.actionBtn, s.cancelBtn, isProcessing && s.btnDisabled]}
                            onPress={() => handleCancel(item)}
                            disabled={!!loadingId}
                            activeOpacity={0.6}
                          >
                            <XIcon size={14} color={DANGER} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[s.actionBtn, s.completeBtn, isProcessing && s.btnDisabled]}
                            onPress={() => handleComplete(item)}
                            disabled={!!loadingId}
                            activeOpacity={0.6}
                          >
                            <CheckIcon size={14} color={SUCCESS} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default DoctorDashboard