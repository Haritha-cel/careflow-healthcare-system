import api from './axiosInstance'; 

export const loginUser = async (data) => {
  try {
    const response = await api.post('/api/auth/otp-login', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ KEEP THIS if you still want raw Google login as a fallback
export const googleLogin = async (idToken) => {
  try {
    const response = await api.post('/api/auth/google', { idToken: idToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ NEW: Clerk Login for Expo Go
export const clerkLogin = async (clerkToken) => {
  try {
    const response = await api.post('/api/auth/clerk-verify', { token: clerkToken });
    return response.data;
  } catch (error) {
    throw error;
  }
};