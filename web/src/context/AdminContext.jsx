import { useState, createContext, useEffect } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const AdminContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL

// =========================================
// ✅ ADMIN AXIOS — cookies sent automatically
// =========================================
const adminAxios = axios.create({
    baseURL: backendUrl,
    withCredentials: true  // browser attaches HttpOnly cookie on every request
});

// ✅ Queue for requests that arrive while a token refresh is already in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
    failedQueue = [];
};

// ✅ RESPONSE INTERCEPTOR: silent refresh on 401
adminAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If already refreshing, queue this request until refresh completes
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => adminAxios(originalRequest))
                .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                // ✅ Refresh cookie is sent automatically — empty body is correct
                await adminAxios.post('/api/auth/refresh');
                processQueue(null);
                return adminAxios(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // Session truly expired — redirect to login
                window.location.href = '/admin/login';
                toast.error("Session expired. Please login again.");
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

const AdminContextProvider = (props) => {

    // ✅ aToken is just an in-memory session marker (e.g. "ADMIN").
    // It is NOT the JWT. It is lost on page refresh intentionally —
    // verifySession() below rehydrates it from the cookie.
    const [aToken, setAToken] = useState('')
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState({ latestAppointments: [] })

    // ✅ Called on mount: if a valid cookie exists, rehydrate React state
    // This handles hard refresh without requiring the user to log in again
    const verifySession = async () => {
        try {
            const { data } = await adminAxios.get('/api/auth/verify');
            if (data.success && data.roles?.includes('ADMIN')) {
                setAToken('ADMIN');
            }
        } catch {
            setAToken(''); // No valid session — stay on login page
        }
    }

    useEffect(() => {
        verifySession();
    }, []);

    // ✅ LOGOUT: server wipes the cookie, we clear React state
    const logout = async () => {
        try {
            await adminAxios.post('/api/auth/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setAToken('');
            window.location.href = '/admin/login';
        }
    }

    // =========================================
    // API FUNCTIONS — cookies sent automatically, no manual headers needed
    // =========================================

    const getAllDoctors = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/doctor-list')
            if (data) setDoctors(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const { data } = await adminAxios.post('/api/admin/change-availability', { docId })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllAppointments = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/all-appointments')
            if (data) setAppointments(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await adminAxios.post('/api/admin/cancel-appointment', { id: appointmentId })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                return true;
            } else {
                toast.error(data.message)
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
            return false;
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await adminAxios.post('/api/admin/complete-appointment', { id: appointmentId })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
                return true;
            } else {
                toast.error(data.message)
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
            return false;
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await adminAxios.get('/api/admin/dashboard')
            if (data) setDashData(data)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const addDoctor = async (formData) => {
        try {
            const { data } = await adminAxios.post('/api/admin/add-doctor', formData)
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                return true;
            } else {
                toast.error(data.message)
                return false;
            }
        } catch (error) {
            toast.error(error.message)
            return false;
        }
    }

    const value = {
        aToken, setAToken,
        backendUrl,
        adminAxios,    // expose so any admin component can make authenticated calls
        doctors, getAllDoctors, changeAvailability, addDoctor,
        appointments, getAllAppointments,
        cancelAppointment, completeAppointment,
        dashData, getDashData,
        logout
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider