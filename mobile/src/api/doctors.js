import api from './axiosInstance'; // ✅ Using the secure instance
import { API_PATH } from './constant';

// Public endpoint
export const fetchDoctors = async () => {
    const url = API_PATH.DOCTORS;
    const { data } = await api.get(url); // api instance handles base URL
    return data.doctors;
};

// Public endpoint
export const fetchDoctorById = async (id) => {
    const url = `${API_PATH.DOCTOR_DETAILS}/${id}`;
    const { data } = await api.get(url);
    return data.doctor;
};