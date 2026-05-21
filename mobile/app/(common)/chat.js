import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import {
  Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput,
  TouchableOpacity, useWindowDimensions, View, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { io } from 'socket.io-client';

import { AuthContext } from '../../src/context/AuthContext';
import { useDoctorContext } from '../../src/context/DoctorContext';
import { useAppContext } from '../../src/context/AppProvider';

const SERVER_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

const PRIMARY = '#4361EE';
const BG = '#F0F4FF';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const formatTime = (iso) => {
  const d = new Date(iso);

  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─────────────────────────────────────────────────────────────
// Bubble
// ─────────────────────────────────────────────────────────────
const Bubble = ({ msg, isMine, showRead, styles }) => (
  <View style={[styles.bubbleRow, isMine ? styles.rowRight : styles.rowLeft]}>
    <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
      <Text style={[styles.bubbleText, isMine ? styles.textMine : styles.textTheirs]}>
        {msg.text}
      </Text>

      <View style={styles.bubbleMeta}>
        <Text style={[styles.timeText, isMine ? styles.timeMine : styles.timeTheirs]}>
          {formatTime(msg.timestamp)}
        </Text>

        {isMine && (
          <Text style={styles.readTick}>
            {showRead ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────
// Typing Bubble
// ─────────────────────────────────────────────────────────────
const TypingBubble = ({ styles }) => (
  <View style={[styles.bubbleRow, styles.rowLeft]}>
    <View style={[styles.bubble, styles.bubbleTheirs, styles.typingBubble]}>
      <View style={styles.typingDots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { opacity: 0.4 + i * 0.2 },
            ]}
          />
        ))}
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const ChatScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const { user, token: patientToken } = useContext(AuthContext);
  const { dToken, profileData } = useDoctorContext();
  const { markAsRead } = useAppContext();

  const { width, height } = useWindowDimensions();

  // ───────────────────────────────────────────────────────────
  // Responsive
  // ───────────────────────────────────────────────────────────
  const scale = Math.min(width, height) / 375;

  const normalize = (size) => Math.round(size * scale);

  const isSmallDevice = height < 700;
  const isTablet = Math.min(width, height) >= 600;

  // ───────────────────────────────────────────────────────────
  // IDs
  // ───────────────────────────────────────────────────────────
  const isDoctor = params.isDoctor === 'true';

  const resolvedDoctorId =
    params.doctorId ||
    profileData?.id ||
    profileData?._id;

  const resolvedUserId =
    params.userId ||
    user?.id ||
    user?._id;

  const myId = isDoctor
    ? resolvedDoctorId
    : resolvedUserId;

  const otherId = isDoctor
    ? resolvedUserId
    : resolvedDoctorId;

  const appointmentId = params.appointmentId;

  const roomId = appointmentId
    ? `appt_${appointmentId}`
    : null;

  const authToken = isDoctor
    ? dToken
    : patientToken;

  // ───────────────────────────────────────────────────────────
  // Refs
  // ───────────────────────────────────────────────────────────
  const socket = useRef(null);
  const flatListRef = useRef(null);
  const typingTimer = useRef(null);
  const isAuthenticated = useRef(false);

  // IMPORTANT:
  // Always keep latest token here
  const authTokenRef = useRef(authToken);

  // ───────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [otherOnline, setOtherOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [connectionState, setConnectionState] = useState('idle');

  // ───────────────────────────────────────────────────────────
  // Update latest token
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    authTokenRef.current = authToken;

    // silently re-authenticate
    if (socket.current?.connected && authToken) {
      console.log('🔄 Re-authenticating socket');

      socket.current.emit('authenticate', {
        token: authToken,
      });
    }
  }, [authToken]);

  // ───────────────────────────────────────────────────────────
  // Scroll bottom
  // ───────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Mark read
  // ───────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (appointmentId) {
        markAsRead(appointmentId);
      }
    }, [appointmentId, markAsRead])
  );

  // ───────────────────────────────────────────────────────────
  // SOCKET CONNECTION
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!myId || !roomId || !authToken) {
      setConnectionState('idle');
      return;
    }

    setConnectionState('connecting');

    const s = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socket.current = s;

    // CONNECT
    s.on('connect', () => {
      console.log('🔌 Connected');

      s.emit('authenticate', {
        token: authTokenRef.current,
      });
    });

    // AUTH SUCCESS
    // s.on('authenticated', ({ userId }) => {
    //   console.log('✅ Authenticated:', userId);

    //   setConnectionState('connected');

    //   s.emit('join_room', {
    //     appointmentId,
    //   });

    //   s.emit('check_online', {
    //     userId: otherId,
    //   });
    // });

    s.on('authenticated', ({ userId }) => {
      console.log('✅ Authenticated:', userId);
      setConnectionState('connected');

      // ✅ Only join room on FIRST authentication, not on token refresh re-auth
      if (!isAuthenticated.current) {
        isAuthenticated.current = true;
        s.emit('join_room', { appointmentId });
        setTimeout(() => s.emit('check_online', { userId: otherId }), 500);
      } else {
        console.log('🔄 Re-authenticated, keeping existing room');
      }
    });

    // TOKEN EXPIRED
    let refreshCooldown = false;

    s.on('token_expired', () => {
      if (refreshCooldown) return;

      refreshCooldown = true;

      setTimeout(() => {
        refreshCooldown = false;
      }, 5000);

      console.log('⚠️ Token expired');

      // wait until interceptor refreshes token
      setTimeout(() => {
        const latestToken = authTokenRef.current;

        if (latestToken && s.connected) {
          console.log('🔄 Sending refreshed token');

          s.emit('authenticate', {
            token: latestToken,
          });
        }
      }, 1500);
    });

    // AUTH ERROR
    s.on('auth_error', ({ message }) => {
      console.log('❌ Auth error:', message);

      setConnectionState('error');
    });

    // MESSAGE HISTORY
    s.on('message_history', (history) => {
      setMessages(history || []);

      if (history?.length > 0) {
        s.emit('mark_read', {
          roomId,
          userId: myId,
        });
      }

      scrollToBottom();
    });

    // RECEIVE MESSAGE
    s.on('receive_message', (msg) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === msg.id);

        if (exists) return prev;

        return [...prev, msg];
      });

      if (msg.from !== myId) {
        s.emit('mark_read', {
          roomId,
          userId: myId,
        });
      }

      scrollToBottom();
    });

    // TYPING
    s.on('typing', ({ isTyping: typing }) => {
      setIsTyping(typing);

      if (typing) {
        scrollToBottom();
      }
    });

    // READ RECEIPTS
    s.on('messages_read', ({ readBy }) => {
      if (readBy !== myId) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (
              msg.from === myId &&
              !msg.readBy.includes(readBy)
            ) {
              return {
                ...msg,
                readBy: [...msg.readBy, readBy],
              };
            }

            return msg;
          })
        );
      }
    });

    // ONLINE
    s.on('user_online', ({ userId }) => {
      if (userId === otherId) {
        setOtherOnline(true);
      }
    });

    // OFFLINE
    s.on('user_offline', ({ userId }) => {
      if (userId === otherId) {
        setOtherOnline(false);
      }
    });

    // CLEAR CHAT
    s.on('chat_cleared', () => {
      setMessages([]);
    });

    // CONNECT ERROR
    s.on('connect_error', (err) => {
      console.log('❌ Connection error:', err.message);

      setConnectionState('error');
    });

    // DISCONNECT
    s.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });

    // CLEANUP
  //   return () => {
  //     clearTimeout(typingTimer.current);

  //     s.removeAllListeners();

  //     s.disconnect();
  //   };
  // }, [myId, roomId]);

  return () => {
    clearTimeout(typingTimer.current);
    isAuthenticated.current = false;
    s.removeAllListeners();
    s.disconnect();
  };
}, [myId, roomId]);

// ───────────────────────────────────────────────────────────
// SEND MESSAGE
// ───────────────────────────────────────────────────────────
const sendMessage = () => {
  const text = inputText.trim();

  if (
    !text ||
    !socket.current ||
    !myId ||
    !roomId ||
    connectionState !== 'connected'
  ) {
    return;
  }

  socket.current.emit('send_message', {
    roomId,
    from: myId,
    toUserId: otherId,
    text,
  });

  socket.current.emit('typing', {
    roomId,
    from: myId,
    isTyping: false,
  });

  setInputText('');

  clearTimeout(typingTimer.current);
};

// ───────────────────────────────────────────────────────────
// HANDLE TYPING
// ───────────────────────────────────────────────────────────
const handleTyping = (text) => {
  setInputText(text);

  if (
    !socket.current ||
    !roomId ||
    connectionState !== 'connected'
  ) {
    return;
  }

  socket.current.emit('typing', {
    roomId,
    from: myId,
    isTyping: true,
  });

  clearTimeout(typingTimer.current);

  typingTimer.current = setTimeout(() => {
    socket.current?.emit('typing', {
      roomId,
      from: myId,
      isTyping: false,
    });
  }, 1500);
};

// ───────────────────────────────────────────────────────────
// CLEAR CHAT
// ───────────────────────────────────────────────────────────
const handleClearChat = () => {
  setShowMenu(false);

  Alert.alert(
    'Clear Chat',
    'This will clear the chat only for you.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          socket.current?.emit('clear_chat', {
            roomId,
            userId: myId,
          });

          setMessages([]);
        },
      },
    ]
  );
};

// ───────────────────────────────────────────────────────────
// Names
// ───────────────────────────────────────────────────────────
const otherName = isDoctor
  ? (params.patientName || 'Patient')
  : (params.doctorName || 'Doctor');

const otherImage = isDoctor
  ? (params.patientImage || null)
  : (params.doctorImage || null);

// ───────────────────────────────────────────────────────────
// Dynamic Styles
// ───────────────────────────────────────────────────────────
const dynamicStyles = {
  header: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
  },

  bubble: {
    maxWidth: isTablet ? '65%' : '78%',
    borderRadius: normalize(18),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(9),
  },

  bubbleText: {
    fontSize: normalize(15),
    lineHeight: normalize(21),
  },

  textInput: {
    borderRadius: normalize(22),
    paddingHorizontal: normalize(16),
    paddingVertical:
      Platform.OS === 'ios'
        ? normalize(10)
        : normalize(8),

    fontSize: normalize(15),
  },
};

const mergedStyles = useMemo(() => {
  const merged = {};

  for (const key of Object.keys(styles)) {
    merged[key] = [styles[key], dynamicStyles[key]];
  }

  return merged;
}, [width, height]);

// ───────────────────────────────────────────────────────────
// Loading
// ───────────────────────────────────────────────────────────
if (
  connectionState === 'idle' ||
  connectionState === 'connecting'
) {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.centerBox}>
        <Text>Connecting...</Text>
      </View>
    </SafeAreaView>
  );
}

// ───────────────────────────────────────────────────────────
// Error
// ───────────────────────────────────────────────────────────
if (connectionState === 'error') {
  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.centerBox}>
        <Text>Connection Failed</Text>
      </View>
    </SafeAreaView>
  );
}

// ───────────────────────────────────────────────────────────
// UI
// ───────────────────────────────────────────────────────────
return (
  <>
    <Stack.Screen options={{ headerShown: false }} />

    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {otherImage ? (
            <Image
              source={{ uri: otherImage }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarInitial}>
                {otherName?.[0]?.toUpperCase() ?? 'D'}
              </Text>
            </View>
          )}

          <View>
            <Text style={styles.headerName}>
              {otherName}
            </Text>

            <Text
              style={[
                styles.headerStatus,
                {
                  color: otherOnline
                    ? '#43a047'
                    : '#A0A5C0',
                },
              ]}
            >
              {otherOnline
                ? '● Online'
                : '○ Offline'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowMenu((v) => !v)}
        >
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>

        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleClearChat}
            >
              <Text style={styles.menuItemText}>
                🗑 Clear Chat
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* BODY */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messageList,
            styles.grow,
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          renderItem={({ item }) => {
            const isMine = item.from === myId;

            const showRead =
              isMine &&
              item.readBy &&
              item.readBy.includes(otherId);

            return (
              <Bubble
                msg={item}
                isMine={isMine}
                showRead={showRead}
                styles={mergedStyles}
              />
            );
          }}
        />

        {isTyping && (
          <TypingBubble styles={mergedStyles} />
        )}

        {/* INPUT */}
        <View style={styles.inputBar}>
          <TextInput
            style={[
              styles.textInput,
              dynamicStyles.textInput,
            ]}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor="#A0A5C0"
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputText.trim() &&
              styles.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </>
);
};

export default ChatScreen;

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  flex: {
    flex: 1,
  },

  grow: {
    flexGrow: 1,
  },

  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E8ECF8',
    zIndex: 100,             // ✅ FIX: Force header above FlatList
    elevation: 100,          // ✅ FIX: Force header above FlatList (Android)
    overflow: 'visible',     // ✅ FIX: Allow dropdown to render outside header bounds
  },

  backArrow: {
    fontSize: 22,
    color: PRIMARY,
    fontWeight: '700',
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10,
  },

  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  headerAvatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY + '22',
  },

  headerAvatarInitial: {
    color: PRIMARY,
    fontWeight: '700',
  },

  headerName: {
    fontWeight: '700',
    color: '#1A1A2E',
  },

  headerStatus: {
    fontSize: 12,
  },

  menuDots: {
    fontSize: 22,
  },

  menuDropdown: {
    position: 'absolute',
    top: '100%',             // ✅ FIX: Dynamically sits right below the header
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 150,
    zIndex: 999,             // ✅ FIX: Keep above everything
    elevation: 999,          // ✅ FIX: Keep above everything (Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E8ECF8',
  },

  menuItem: {
    paddingVertical: 10,     // ✅ FIX: Better touch target
    paddingHorizontal: 12,
  },

  menuItemText: {
    color: '#e53935',
    fontWeight: '600',
  },

  messageList: {
    padding: 14,
  },

  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  rowRight: {
    justifyContent: 'flex-end',
  },

  rowLeft: {
    justifyContent: 'flex-start',
  },

  bubble: {},

  bubbleMine: {
    backgroundColor: PRIMARY,
  },

  bubbleTheirs: {
    backgroundColor: '#fff',
  },

  bubbleText: {},

  textMine: {
    color: '#fff',
  },

  textTheirs: {
    color: '#1A1A2E',
  },

  bubbleMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 5,
    marginTop: 3,
  },

  timeText: {
    fontSize: 10,
  },

  timeMine: {
    color: 'rgba(255,255,255,0.7)',
  },

  timeTheirs: {
    color: '#A0A5C0',
  },

  readTick: {
    color: 'rgba(255,255,255,0.8)',
  },

  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  typingDots: {
    flexDirection: 'row',
    gap: 5,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7B7F9E',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E8ECF8',
  },

  textInput: {
    flex: 1,
    backgroundColor: BG,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#DDE2F5',
  },

  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  sendBtnDisabled: {
    backgroundColor: '#C5CCF0',
  },

  sendIcon: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});