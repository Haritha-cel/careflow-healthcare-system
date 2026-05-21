import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";
import { Alert } from "react-native";
import { storage } from "../utils/storage";
// ✅ Import from globalTokenStore
import { setGlobalSetDToken } from './globalTokenStore';

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
    const [dToken, setDTokenState] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(null);
    const [profileData, setProfileData] = useState(null);

    // ✅ Register setter immediately on mount
    useEffect(() => {
        setGlobalSetDToken(setDTokenState);
    }, []);

    const setDToken = useCallback((token) => {
        setDTokenState(token);
        setGlobalSetDToken(setDTokenState);
        if (token) {
            storage.setItem("dToken", token);
        } else {
            storage.removeItem("dToken");
        }
    }, []);

    const loadToken = useCallback(async () => {
        try {
            const token = await storage.getItem("dToken");
            if (token) setDToken(token);
        } catch (err) {
            console.error("Error loading doctor token", err);
        }
    }, [setDToken]);

    useEffect(() => {
        loadToken();
    }, []);

    const getAppointments = useCallback(async () => {
        try {
            const { data } = await api.get('/api/doctor/appointments');
            if (data.success) setAppointments(data.appointments);
        } catch (err) {
            console.log("getAppointments error:", err.message);
        }
    }, []);

    const getDashData = useCallback(async () => {
        try {
            const { data } = await api.get('/api/doctor/dashboard');
            if (data.success) setDashData(data.dashData);
        } catch (err) {
            console.log("getDashData error:", err.message);
        }
    }, []);

    const getProfileData = useCallback(async () => {
        try {
            const { data } = await api.get('/api/doctor/profile');
            if (data.success) {
                setProfileData(data.profileData);
                return data.profileData;
            }
        } catch (err) {
            console.log("getProfileData error:", err.message);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        await Promise.all([getAppointments(), getDashData()]);
    }, [getAppointments, getDashData]);

    const completeAppointment = useCallback(async (appointmentId) => {
        try {
            const { data } = await api.post('/api/doctor/complete', { appointmentId });
            if (data.success) {
                await refreshAll();
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || err.message);
        }
    }, [refreshAll]);

    const cancelAppointment = useCallback(async (appointmentId) => {
        try {
            const { data } = await api.post('/api/doctor/cancel', { appointmentId });
            if (data.success) {
                await refreshAll();
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (err) {
            Alert.alert("Error", err.response?.data?.message || err.message);
        }
    }, [refreshAll]);

    return (
        <DoctorContext.Provider value={{
            dToken,
            setDToken,
            appointments,
            dashData,
            setDashData,
            profileData,
            setProfileData,
            loadToken,
            getAppointments,
            completeAppointment,
            cancelAppointment,
            getDashData,
            getProfileData,
        }}>
            {children}
        </DoctorContext.Provider>
    );
};

export const useDoctorContext = () => useContext(DoctorContext);
export default DoctorContextProvider;