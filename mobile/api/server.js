import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URLS || '*',
        methods: ['GET', 'POST', 'PUT']
    }
});

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';
const users = {};

async function validateToken(token) {
    try {
        const res = await axios.get(`${SPRING_BOOT_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
        });
        const id = res.data?.userData?.id || res.data?.userData?._id;
        if (id) return { valid: true, userId: id, expired: false };
    } catch (err) {
        const status = err.response?.status;
        if (status === 401) return { valid: false, userId: null, expired: true };
    }

    try {
        const res = await axios.get(`${SPRING_BOOT_URL}/api/doctor/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
        });
        const id = res.data?.profileData?.id || res.data?.profileData?._id;
        if (id) return { valid: true, userId: id, expired: false };
    } catch (err) {
        const status = err.response?.status;
        if (status === 401) return { valid: false, userId: null, expired: true };
    }

    return { valid: false, userId: null, expired: false };
}

async function callSpringBoot(method, path, token, data = null, socket = null) {
    try {
        const config = {
            method,
            url: `${SPRING_BOOT_URL}${path}`,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            timeout: 8000,
        };
        if (data) config.data = data;
        const res = await axios(config);
        return { success: true, data: res.data };
    } catch (err) {
        const status = err.response?.status;
        console.error(`Spring Boot Error [${method} ${path}]:`, status, err.message);
        if (status === 401 && socket) socket.emit('token_expired');
        return { success: false, status };
    }
}

io.on('connection', (socket) => {
    console.log('✅ Connected:', socket.id);

    let currentUserToken = null;
    let currentUserId = null;

    socket.on('authenticate', async ({ token }) => {
        if (!token) {
            socket.emit('auth_error', { message: 'Token required' });
            socket.disconnect();
            return;
        }

        const validation = await validateToken(token);

        if (validation.expired) {
            if (currentUserId) {
                const now = Date.now();
                if (!socket.data.lastTokenExpired || now - socket.data.lastTokenExpired > 5000) {
                    socket.data.lastTokenExpired = now;
                    socket.emit('token_expired');
                }
                return;
            }
            socket.emit('auth_error', { message: 'Token expired' });
            socket.disconnect();
            return;
        }

        if (!validation.valid || !validation.userId) {
            if (currentUserId) {
                const now = Date.now();
                if (!socket.data.lastTokenExpired || now - socket.data.lastTokenExpired > 5000) {
                    socket.data.lastTokenExpired = now;
                    socket.emit('token_expired');
                }
                return;
            }
            socket.emit('auth_error', { message: 'Invalid token' });
            socket.disconnect();
            return;
        }

        const newUserId = validation.userId;
        currentUserToken = token;
        socket.data.token = token;
        socket.data.lastTokenExpired = null;

        if (currentUserId && currentUserId === newUserId) {
            console.log(`🔄 Token refreshed for: ${currentUserId}`);
            socket.emit('authenticated', { userId: currentUserId });
            return;
        }

        if (currentUserId && users[currentUserId]) {
            users[currentUserId].delete(socket.id);
            if (users[currentUserId].size === 0) delete users[currentUserId];
        }

        currentUserId = newUserId;
        if (!users[currentUserId]) users[currentUserId] = new Set();
        users[currentUserId].add(socket.id);
        socket.data.appUserId = currentUserId;

        io.emit('user_online', { userId: currentUserId });
        socket.emit('authenticated', { userId: currentUserId });
        console.log(`✅ Authenticated: ${currentUserId} (${users[currentUserId].size} sockets)`);
    });

    socket.on('check_online', ({ userId }) => {
        const online = !!(users[userId] && users[userId].size > 0);
        socket.emit(online ? 'user_online' : 'user_offline', { userId });
    });

    socket.on('join_room', async ({ appointmentId }) => {
        if (!currentUserId || !currentUserToken) { socket.disconnect(); return; }

        const roomId = `appt_${appointmentId}`;
        socket.join(roomId);
        socket.data.roomId = roomId;

        const result = await callSpringBoot('GET', `/api/chat/history/${roomId}`, currentUserToken, null, socket);
        if (result.success && result.data.success) {
            socket.emit('message_history', result.data.messages);
            console.log(`${currentUserId} joined ${roomId} (${result.data.messages.length} msgs)`);
        } else {
            socket.emit('message_history', []);
        }
    });

    socket.on('send_message', async ({ roomId, from, text }) => {
        if (!text?.trim() || !currentUserToken || from !== currentUserId) return;

        const msgId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const appointmentId = roomId.startsWith('appt_') ? roomId.replace('appt_', '') : null;
        const msg = {
            id: msgId, roomId, appointmentId, from,
            text: text.trim(), timestamp: new Date().toISOString(),
            readBy: [from], clearedBy: []
        };

        const result = await callSpringBoot('POST', '/api/chat/message', currentUserToken, msg, socket);

        if (result.success && result.data.success) {
            const dbMsg = result.data.message;
            const savedMsg = {
                id: dbMsg?.id ?? msg.id,
                from: dbMsg?.from ?? msg.from,
                text: dbMsg?.text ?? msg.text,
                timestamp: dbMsg?.timestamp ?? msg.timestamp,
                readBy: dbMsg?.readBy ?? msg.readBy,
                clearedBy: dbMsg?.clearedBy ?? msg.clearedBy,
                roomId,
                appointmentId,
            };

            // ✅ Send to sockets IN the chat room
            io.to(roomId).emit('receive_message', savedMsg);

            // ✅ Send to layout sockets (NOT in the room) of all other users
            Object.entries(users).forEach(([userId, socketIds]) => {
                if (userId !== from) {
                    socketIds.forEach(sid => {
                        const recipientSocket = io.sockets.sockets.get(sid);
                        if (recipientSocket && !recipientSocket.rooms.has(roomId)) {
                            recipientSocket.emit('receive_message', savedMsg);
                            console.log(`📤 Badge notification → user ${userId}`);
                        }
                    });
                }
            });

            console.log(`[MSG] ${roomId} | ${from}: ${text}`);
        } else {
            socket.emit('message_error', { id: msg.id, message: 'Failed to send message.' });
        }
    });

    socket.on('typing', ({ roomId, from, isTyping }) => {
        if (from !== currentUserId) return;
        socket.to(roomId).emit('typing', { from, isTyping });
    });

    socket.on('mark_read', async ({ roomId, userId }) => {
        if (!currentUserToken || userId !== currentUserId) return;
        const result = await callSpringBoot('PUT', '/api/chat/mark-read', currentUserToken, { roomId, userId }, socket);
        if (result.success) {
            io.to(roomId).emit('messages_read', { roomId, readBy: userId });
        }
    });

    socket.on('chat_viewed', ({ roomId, userId, appointmentId }) => {
        if (userId !== currentUserId) return;
        if (users[userId]) {
            users[userId].forEach(sid => {
                const s = io.sockets.sockets.get(sid);
                if (s) s.emit('clear_badge', { roomId, appointmentId });
            });
        }
    });

    socket.on('clear_chat', async ({ roomId, userId }) => {
        if (!currentUserToken || userId !== currentUserId) return;
        const result = await callSpringBoot('PUT', '/api/chat/clear', currentUserToken, { roomId, userId }, socket);
        if (result.success) socket.emit('chat_cleared', { roomId });
    });

    socket.on('disconnect', () => {
        if (currentUserId && users[currentUserId]) {
            users[currentUserId].delete(socket.id);
            if (users[currentUserId].size === 0) {
                delete users[currentUserId];
                io.emit('user_offline', { userId: currentUserId });
                console.log(`🔴 Offline: ${currentUserId}`);
            }
        }
        console.log('❌ Disconnected:', socket.id);
    });
});

app.get('/health', (_, res) =>
    res.json({ status: 'ok', onlineUsers: Object.keys(users) })
);

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => console.log(`🚀 Socket Server on port ${PORT}`));