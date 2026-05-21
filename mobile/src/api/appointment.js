import api from './axiosInstance'; // ✅ Using the secure instance
import { API_PATH } from "./constant";

export const createAppointment = async ({ 
    doctorId, 
    slotDate, 
    slotTime, 
    paymentMethod = 'cash',
    paymentStatus = 'pending',
    reminderMinutes 
}) => {
    if (!doctorId) throw new Error('No doctor selected');
    if (!slotDate || !slotTime) throw new Error('No time slot selected');

    const url = API_PATH.APPOINTMENT;

    // ✅ api automatically attaches the Bearer token!
    const { data } = await api.post(url, {
        doctorId,
        slotDate,
        slotTime,
        paymentMethod,
        paymentStatus,
        reminderMinutes: reminderMinutes || 0
    });
    return data;
};

// ❌ REMOVED: updatePaymentStatus. The Stripe Webhook handles this securely on the backend!

export const fetchAppointmentById = async (appointmentId) => {
    if (!appointmentId) throw new Error('No appointment ID');
    const url = `${API_PATH.APPOINTMENT_BY_ID}/${appointmentId}`;
    const { data } = await api.get(url); // ✅ api automatically attaches token
    return data;
};