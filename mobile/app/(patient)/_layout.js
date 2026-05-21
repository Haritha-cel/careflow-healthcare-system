import { Tabs, useSegments } from 'expo-router';
import {
  BackHandler, Modal, View,
  Text, TouchableOpacity, StyleSheet, Animated,
  Platform, useWindowDimensions
} from 'react-native';
import { useEffect, useContext, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { io } from 'socket.io-client';
import { AuthContext } from '../../src/context/AuthContext';
import { DoctorContext } from '../../src/context/DoctorContext';
import { useAppContext } from '../../src/context/AppProvider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../src/styles/Color';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SERVER_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

function UnreadBadge({ count, styles }) {
  if (!count) return null;
  return (
    <View style={[styles.base.badge, styles.dynamic.badge]}>
      <Text style={[styles.base.badgeText, styles.dynamic.badgeText]}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
}

function ExitModal({ visible, onCancel, onSwitch, onExit, styles }) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 300, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.base.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View style={[styles.base.sheet, styles.dynamic.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.base.handle, styles.dynamic.handle]} />
          <View style={styles.base.sheetHeader}>
            <Text style={[styles.base.sheetEmoji, styles.dynamic.sheetEmoji]}>🏥</Text>
            <Text style={[styles.base.sheetTitle, styles.dynamic.sheetTitle]}>Patient Portal</Text>
            <Text style={[styles.base.sheetSubtitle, styles.dynamic.sheetSubtitle]}>What would you like to do?</Text>
          </View>
          <TouchableOpacity style={[styles.base.optionBtn, styles.dynamic.optionBtn]} onPress={onSwitch} activeOpacity={0.8}>
            <View style={[styles.base.optionIcon, styles.dynamic.optionIcon, { backgroundColor: '#EEF1FF' }]}>
              <Text style={[styles.base.optionEmoji, styles.dynamic.optionEmoji]}>🔄</Text>
            </View>
            <View style={styles.base.optionText}>
              <Text style={[styles.base.optionLabel, styles.dynamic.optionLabel]}>Switch Account</Text>
              <Text style={[styles.base.optionDesc, styles.dynamic.optionDesc]}>Login as a different user</Text>
            </View>
            <Text style={[styles.base.optionArrow, styles.dynamic.optionArrow]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.base.optionBtn, styles.base.exitBtn, styles.dynamic.optionBtn]} onPress={onExit} activeOpacity={0.8}>
            <View style={[styles.base.optionIcon, styles.dynamic.optionIcon, { backgroundColor: '#FFF0F7' }]}>
              <Text style={[styles.base.optionEmoji, styles.dynamic.optionEmoji]}>🚪</Text>
            </View>
            <View style={styles.base.optionText}>
              <Text style={[styles.base.optionLabel, styles.dynamic.optionLabel, { color: '#F72585' }]}>Exit App</Text>
              <Text style={[styles.base.optionDesc, styles.dynamic.optionDesc]}>Close the application</Text>
            </View>
            <Text style={[styles.base.optionArrow, styles.dynamic.optionArrow, { color: '#F72585' }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.base.cancelBtn, styles.dynamic.cancelBtn]} onPress={onCancel} activeOpacity={0.8}>
            <Text style={[styles.base.cancelText, styles.dynamic.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function PatientLayout() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const { user, token, logout } = useContext(AuthContext);
  const { unreadCounts, incrementUnread, clearAllUnread, markAsRead, loadUnreadCounts } = useAppContext();

  const { width, height } = useWindowDimensions();
  const scale = Math.min(width, height) / 375;
  const normalize = (size) => Math.round(size * scale);
  const isTablet = Math.min(width, height) >= 600;

  const [modalVisible, setModalVisible] = useState(false);
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // ✅ Load unread counts when token is available
  useEffect(() => {
    if (!token) return;
    loadUnreadCounts();
  }, [token]);

  // ── Socket ────────────────────────────────────────────────────
  const socketRef = useRef(null);
  const myIdRef = useRef(null);
  const tokenRef = useRef(token);

  // Keep tokenRef current + re-auth on token refresh
  useEffect(() => {
    tokenRef.current = token;

    if (!token) {
      // Logout — disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        myIdRef.current = null;
      }
      return;
    }

    // Token refreshed — re-authenticate existing socket
    if (socketRef.current?.connected) {
      console.log('🔄 Patient layout re-authenticating');
      socketRef.current.emit('authenticate', { token });
      return;
    }

    // Token available but no socket yet — create it
    if (!socketRef.current) {
      createSocket();
    }
  }, [token]);

  const createSocket = () => {
    const s = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = s;

    s.on('connect', () => {
      console.log('🔌 Patient layout connected');
      s.emit('authenticate', { token: tokenRef.current });
    });

    s.on('authenticated', ({ userId }) => {
      console.log('✅ Patient layout authenticated:', userId);
      myIdRef.current = userId;
    });

    s.on('receive_message', (msg) => {
      const myId = myIdRef.current;
      if (myId && msg.from !== myId && msg.appointmentId) {
        console.log('🔔 Patient badge increment for:', msg.appointmentId);
        incrementUnread(msg.appointmentId, msg.id);
      }
    });

    s.on('clear_badge', ({ appointmentId }) => {
      if (appointmentId) markAsRead(appointmentId);
      else clearAllUnread();
    });

    s.on('token_expired', () => {
      console.log('🔄 Patient layout token expired');
      setTimeout(() => {
        if (socketRef.current?.connected && tokenRef.current) {
          socketRef.current.emit('authenticate', { token: tokenRef.current });
        }
      }, 1000);
    });

    s.on('disconnect', (reason) => {
      console.log('🔌 Patient layout disconnected:', reason);
    });
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      myIdRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ── Back handler ─────────────────────────────────────────────
  useEffect(() => {
    const backAction = () => {
      const currentTab = segments[segments.length - 1];
      if (currentTab === 'home') {
        setModalVisible(true);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [segments]);

  const handleSwitch = async () => {
    setModalVisible(false);
    try {
      await logout();
    } catch (e) {
      console.log('Logout/Switch error', e);
    }
    router.replace('/(auth)/login');
  };

  const handleExit = () => {
    setModalVisible(false);
    BackHandler.exitApp();
  };

  const dynamicStyles = {
    tabBar: {
      height: normalize(60) + insets.bottom,
      paddingBottom: insets.bottom,
      paddingTop: normalize(6),
    },
    tabLabel: { fontSize: normalize(11), marginTop: normalize(2) },
    iconSize: isTablet ? normalize(22) : normalize(24),
    badge: {
      top: normalize(-4), right: normalize(-8),
      minWidth: normalize(18), height: normalize(18),
      paddingHorizontal: normalize(3), borderRadius: normalize(10),
    },
    badgeText: { fontSize: normalize(10) },
    sheet: {
      width: '100%',
      maxWidth: isTablet ? '60%' : '100%',
      alignSelf: 'center',
      paddingHorizontal: normalize(20),
      paddingBottom: normalize(36),
      paddingTop: normalize(12),
      borderTopLeftRadius: normalize(28),
      borderTopRightRadius: normalize(28),
    },
    handle: { width: normalize(40), height: normalize(4), borderRadius: normalize(2), marginBottom: normalize(20) },
    sheetEmoji: { fontSize: isTablet ? normalize(32) : normalize(40), marginBottom: normalize(8) },
    sheetTitle: { fontSize: normalize(20) },
    sheetSubtitle: { fontSize: normalize(13), marginTop: normalize(4) },
    sheetHeader: { marginBottom: normalize(24) },
    optionBtn: { padding: normalize(16), marginBottom: normalize(10), gap: normalize(14), borderRadius: normalize(16) },
    optionIcon: { width: normalize(44), height: normalize(44), borderRadius: normalize(12) },
    optionEmoji: { fontSize: normalize(20) },
    optionLabel: { fontSize: normalize(15) },
    optionDesc: { fontSize: normalize(12), marginTop: normalize(2) },
    optionArrow: { fontSize: normalize(22) },
    cancelBtn: { marginTop: normalize(6), paddingVertical: normalize(14), borderRadius: normalize(14) },
    cancelText: { fontSize: normalize(15) },
  };

  const componentStyles = { base: styles, dynamic: dynamicStyles };

  return (
    <>
      <ExitModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSwitch={handleSwitch}
        onExit={handleExit}
        styles={componentStyles}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.PRIMARY,
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: [styles.tabBar, dynamicStyles.tabBar],
          tabBarLabelStyle: [styles.tabLabel, dynamicStyles.tabLabel],
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={dynamicStyles.iconSize} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="my-appointments"
          options={{
            tabBarLabel: 'Appointments',
            tabBarIcon: ({ focused, color }) => (
              <View>
                <MaterialCommunityIcons
                  name={focused ? 'calendar-check' : 'calendar-check-outline'}
                  size={dynamicStyles.iconSize}
                  color={color}
                />
                <UnreadBadge count={totalUnread} styles={componentStyles} />
              </View>
            ),
            listeners: { tabPress: () => clearAllUnread() },
          }}
        />
        <Tabs.Screen
          name="my-profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={dynamicStyles.iconSize} color={color} />
            )
          }}
        />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="all-doctors" options={{ href: null }} />
        <Tabs.Screen name="doctor-details" options={{ href: null }} />
        <Tabs.Screen name="book-appointment" options={{ href: null }} />
        <Tabs.Screen name="view-appointment" options={{ href: null }} />
        <Tabs.Screen name="payment-method-selection" options={{ href: null }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabLabel: { fontWeight: '600' },
  badge: {
    position: 'absolute',
    backgroundColor: '#F72585',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff' },
  handle: { backgroundColor: '#E0E0E0', alignSelf: 'center' },
  sheetHeader: { alignItems: 'center' },
  sheetEmoji: {},
  sheetTitle: { fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.5 },
  sheetSubtitle: { color: '#7B7F9E' },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFBFF', borderWidth: 1, borderColor: '#ECEEFF',
  },
  exitBtn: { borderColor: '#FFE0F0', backgroundColor: '#FFFAFE' },
  optionIcon: { alignItems: 'center', justifyContent: 'center' },
  optionEmoji: {},
  optionText: { flex: 1 },
  optionLabel: { fontWeight: '700', color: '#1A1A2E' },
  optionDesc: { color: '#7B7F9E' },
  optionArrow: { color: '#C0C4E0', fontWeight: '300' },
  cancelBtn: { alignItems: 'center', backgroundColor: '#F5F7FF' },
  cancelText: { fontWeight: '700', color: '#7B7F9E' },
});