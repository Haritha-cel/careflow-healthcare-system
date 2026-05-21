import api from './axiosInstance'; // ✅ Using the secure instance
import { API_PATH } from "./constant";

export const fetchSpecialities = async () => {
    const url = API_PATH.SPECIALITY;
    const { data } = await api.get(url);
    return data;
};