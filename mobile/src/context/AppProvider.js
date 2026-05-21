import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState({});
  const seenMessageIds = useRef(new Set());

  // ✅ useCallback prevents new function reference on every render
  const loadUnreadCounts = useCallback(async () => {
    try {
      const { data } = await api.get('/api/chat/unread-count');
      if (data.success && data.unreadCounts) {
        const converted = {};
        Object.entries(data.unreadCounts).forEach(([roomId, count]) => {
          const appointmentId = roomId.replace('appt_', '');
          converted[appointmentId] = count;
        });
        setUnreadCounts(converted);
        console.log('✅ Loaded unread counts:', converted);
      }
    } catch (err) {
      console.log('Unread count load skipped:', err.message);
    }
  }, []); // ✅ Empty deps — api instance never changes

  const markAsRead = useCallback((appointmentId) => {
    if (!appointmentId) return;
    setUnreadCounts((prev) => ({ ...prev, [appointmentId]: 0 }));
  }, []);

  const incrementUnread = useCallback((appointmentId, messageId) => {
    if (!appointmentId) return;
    if (messageId && seenMessageIds.current.has(messageId)) return;
    if (messageId) seenMessageIds.current.add(messageId);
    setUnreadCounts((prev) => ({
      ...prev,
      [appointmentId]: (prev[appointmentId] || 0) + 1,
    }));
  }, []);

  const clearAllUnread = useCallback(() => setUnreadCounts({}), []);

  return (
    <AppContext.Provider
      value={{
        unreadCounts,
        markAsRead,
        incrementUnread,
        clearAllUnread,
        loadUnreadCounts,
        values: { currency: '$' },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;