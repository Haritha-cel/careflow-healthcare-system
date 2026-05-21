import { Tabs, useSegments } from 'expo-router';
import {
  BackHandler, Modal, View,
  Text, TouchableOpacity, StyleSheet, Animated, Platform, useWindowDimensions
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

function UnreadBadge({ count, dynamicStyles }) {
  if (!count) return null;
  return (
    <View style={[styles.badge, dynamicStyles.badge]}>
      <Text style={[styles.badgeText, dynamicStyles.badgeText]}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

function ExitModal({ visible, onCancel, onSwitch, onExit, dynamicStyles }) {
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
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View style={[styles.sheet, dynamicStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.handle, dynamicStyles.handle]} />
          <View style={[styles.sheetHeader, dynamicStyles.sheetHeader]}>
            <Text style={[styles.sheetEmoji, dynamicStyles.sheetEmoji]}>👨‍⚕️</Text>
            <Text style={[styles.sheetTitle, dynamicStyles.sheetTitle]}>Doctor Portal</Text>
            <Text style={[styles.sheetSubtitle, dynamicStyles.sheetSubtitle]}>What would you like to do?</Text>
          </View>
          <TouchableOpacity style={[styles.optionBtn, dynamicStyles.optionBtn]} onPress={onSwitch} activeOpacity={0.8}>
            <View style={[styles.optionIcon, dynamicStyles.optionIcon, { backgroundColor: '#EEF1FF' }]}>
              <Text style={[styles.optionEmoji, dynamicStyles.optionEmoji]}>🔄</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, dynamicStyles.optionLabel]}>Switch Account</Text>
              <Text style={[styles.optionDesc, dynamicStyles.optionDesc]}>Login as a different user</Text>
            </View>
            <Text style={[styles.optionArrow, dynamicStyles.optionArrow]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionBtn, styles.exitBtn, dynamicStyles.optionBtn]} onPress={onExit} activeOpacity={0.8}>
            <View style={[styles.optionIcon, dynamicStyles.optionIcon, { backgroundColor: '#FFF0F7' }]}>
              <Text style={[styles.optionEmoji, dynamicStyles.optionEmoji]}>🚪</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, dynamicStyles.optionLabel, { color: '#F72585' }]}>Exit App</Text>
              <Text style={[styles.optionDesc, dynamicStyles.optionDesc]}>Close the application</Text>
            </View>
            <Text style={[styles.optionArrow, dynamicStyles.optionArrow, { color: '#F72585' }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelBtn, dynamicStyles.cancelBtn]} onPress={onCancel} activeOpacity={0.8}>
            <Text style={[styles.cancelText, dynamicStyles.cancelText]}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default function DoctorLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { logout } = useContext(AuthContext);
  const { profileData, getProfileData, dToken } = useContext(DoctorContext);
  const { unreadCounts, incrementUnread, clearAllUnread, markAsRead, loadUnreadCounts } = useAppContext();

  const { width, height } = useWindowDimensions();
  const scale = Math.min(width, height) / 375;
  const normalize = (size) => Math.round(size * scale);
  const isTablet = Math.min(width, height) >= 600;
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // ✅ Load profile once when dToken is available
  useEffect(() => {
    if (dToken && !profileData) getProfileData();
  }, [dToken]);

  // ✅ Load unread counts when dToken is available
  useEffect(() => {
    if (!dToken) return;
    loadUnreadCounts();
  }, [dToken]);

  // ── Socket ────────────────────────────────────────────────────
  const socketRef = useRef(null);
  const myIdRef = useRef(null);
  const dTokenRef = useRef(dToken);

  useEffect(() => {
    dTokenRef.current = dToken;

    if (!dToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        myIdRef.current = null;
      }
      return;
    }

    if (socketRef.current?.connected) {
      console.log('🔄 Doctor layout re-authenticating');
      socketRef.current.emit('authenticate', { token: dToken });
      return;
    }

    if (!socketRef.current) {
      createSocket();
    }
  }, [dToken]);

  const createSocket = () => {
    const s = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = s;

    s.on('connect', () => {
      console.log('🔌 Doctor layout connected');
      s.emit('authenticate', { token: dTokenRef.current });
    });

    s.on('authenticated', ({ userId }) => {
      console.log('✅ Doctor layout authenticated:', userId);
      myIdRef.current = userId;
    });

    s.on('receive_message', (msg) => {
      const myId = myIdRef.current;
      if (myId && msg.from !== myId && msg.appointmentId) {
        console.log('🔔 Doctor badge increment for:', msg.appointmentId);
        incrementUnread(msg.appointmentId, msg.id);
      }
    });

    s.on('clear_badge', ({ appointmentId }) => {
      if (appointmentId) markAsRead(appointmentId);
      else clearAllUnread();
    });

    s.on('token_expired', () => {
      console.log('🔄 Doctor layout token expired');
      setTimeout(() => {
        if (socketRef.current?.connected && dTokenRef.current) {
          socketRef.current.emit('authenticate', { token: dTokenRef.current });
        }
      }, 1000);
    });

    s.on('disconnect', (reason) => {
      console.log('🔌 Doctor layout disconnected:', reason);
    });
  };

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
      if (currentTab === 'dashboard') {
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

  return (
    <>
      <ExitModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSwitch={handleSwitch}
        onExit={handleExit}
        dynamicStyles={dynamicStyles}
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
          name="dashboard"
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={dynamicStyles.iconSize} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="appointments"
          options={{
            tabBarLabel: 'Appointments',
            tabBarIcon: ({ focused, color }) => (
              <View>
                <MaterialCommunityIcons
                  name={focused ? 'calendar-check' : 'calendar-check-outline'}
                  size={dynamicStyles.iconSize}
                  color={color}
                />
                <UnreadBadge count={totalUnread} dynamicStyles={dynamicStyles} />
              </View>
            ),
            listeners: { tabPress: () => clearAllUnread() },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={dynamicStyles.iconSize} color={color} />
            )
          }}
        />
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