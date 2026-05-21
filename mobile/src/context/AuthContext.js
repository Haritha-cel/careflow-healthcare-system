import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axiosInstance";
import { storage } from "../utils/storage";
import axios from "axios";
import { useClerk } from "@clerk/clerk-expo";
import { setGlobalSetToken } from './globalTokenStore';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setTokenState] = useState(null);
    const [user, setUserState] = useState(null);
    const [role, setRoleState] = useState(null);
    const [loading, setLoading] = useState(true);

    const { signOut } = useClerk();

    useEffect(() => {
        setGlobalSetToken(setTokenState);
    }, []);

    const setToken = async (newToken) => {
        if (newToken) {
            await storage.setItem("token", newToken);
            setTokenState(newToken);
            setGlobalSetToken(setTokenState);
        } else {
            await storage.removeItem("token");
            setTokenState(null);
        }
    };

    const setUser = async (newUser) => {
        if (newUser) {
            await storage.setItem("user", JSON.stringify(newUser));
            setUserState(newUser);
        } else {
            await storage.removeItem("user");
            setUserState(null);
        }
    };

    const setRole = async (newRole) => {
        if (newRole) {
            await storage.setItem("role", newRole);
            setRoleState(newRole);
        } else {
            await storage.removeItem("role");
            setRoleState(null);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/api/user/profile');
            if (data.success) await setUser(data.userData);
        } catch (err) {
            console.log('fetchProfile error:', err.message);
        }
    };

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const savedRole = await storage.getItem("role");

                if (savedRole === 'patient') {
                    const savedToken = await storage.getItem("token");
                    const savedUser  = await storage.getItem("user");
                    if (savedToken) {
                        setTokenState(savedToken);
                        setGlobalSetToken(setTokenState);
                        setRoleState('patient');
                        if (savedUser) setUserState(JSON.parse(savedUser));
                        await fetchProfile();
                    }
                } else if (savedRole === 'doctor') {
                    setRoleState('doctor');
                }
            } catch (err) {
                console.log("Load auth error:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(() => setLoading(false), 5000);
        loadAuthData().finally(() => clearTimeout(timeout));
    }, []);

    const loginWithBackendResponse = async (data) => {
        const receivedRole = data.role;
        if (!receivedRole) {
            console.error("❌ Login failed: role missing in backend response", data);
            return;
        }

        await storage.setItem("role", receivedRole);
        await storage.setItem("refreshToken", data.refreshToken);

        if (receivedRole === "patient") {
            await storage.setItem("token", data.accessToken);
            setTokenState(data.accessToken);
            setGlobalSetToken(setTokenState);
            setRoleState("patient");
            if (data.user) {
                await setUser(data.user);
            } else {
                await fetchProfile();
            }
        } else if (receivedRole === "doctor") {
            await storage.setItem("dToken", data.accessToken);
            setRoleState("doctor");
        }
    };

    const logout = async () => {
        // ✅ Step 1: Sign out of Clerk FIRST — it needs the active session to revoke it.
        // If this runs after storage is cleared, Clerk may fail silently.
        try {
            await signOut();
        } catch (e) {
            console.log("Clerk signOut failed:", e.message);
        }

        // ✅ Step 2: Invalidate refresh token on backend
        try {
            const refreshToken = await storage.getItem('refreshToken');
            if (refreshToken) {
                await axios.post(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }
        } catch (e) {
            console.log("Backend logout failed:", e.message);
        }

        // ✅ Step 3: Clear local state and storage last
        setTokenState(null);
        setUserState(null);
        setRoleState(null);
        await storage.multiRemove(["token", "dToken", "user", "role", "refreshToken"]);
    };

    return (
        <AuthContext.Provider value={{
            token, setToken,
            user, setUser,
            role, setRole,
            loading,
            logout,
            fetchProfile,
            loginWithBackendResponse
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;