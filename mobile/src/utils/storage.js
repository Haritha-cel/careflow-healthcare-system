import * as SecureStore from 'expo-secure-store';

export const storage = {
    async getItem(key) {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    async setItem(key, value) {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch {}
    },
    async removeItem(key) {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {}
    },
    async multiRemove(keys) {
        await Promise.all(keys.map(k => SecureStore.deleteItemAsync(k).catch(() => {})));
    },
    async getAllKeys() {
        // SecureStore doesn't support listing keys — return empty array
        return [];
    }
};