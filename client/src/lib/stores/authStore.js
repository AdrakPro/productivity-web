import { writable, derived } from "svelte/store";
import { authApi } from "../services/api.js";

export const user = writable(null);
export const isLoading = writable(true);
export const authError = writable(null);

export const isAuthenticated = derived(user, ($user) => $user !== null);

export async function checkAuth() {
    isLoading.set(true);
    try {
        const userData = await authApi.me();
        user.set(userData);
    } catch (error) {
        user.set(null);
    } finally {
        isLoading.set(false);
    }
}

export async function login(email, password) {
    authError.set(null);
    try {
        const result = await authApi.login({ email, password });
        user.set(result.user);
        return result;
    } catch (error) {
        authError.set(error.message);
        throw error;
    }
}

export async function register(email, username, password) {
    authError.set(null);
    try {
        const result = await authApi.register({ email, username, password });
        user.set(result.user);
        return result;
    } catch (error) {
        authError.set(error.message);
        throw error;
    }
}

export async function logout() {
    try {
        await authApi.logout();
    } finally {
        user.set(null);
    }
}

export async function changePassword(currentPassword, newPassword) {
    return authApi.changePassword({ currentPassword, newPassword });
}

export async function deleteAccount() {
    await authApi.deleteAccount();
    user.set(null);
}
