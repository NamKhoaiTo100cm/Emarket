// services/auth.service.ts
import { apiFetch } from '@/lib/api'
export const authService = {
    login: (email: string, password: string) =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        }),

    logout: () =>
        apiFetch('/auth/logout', { method: 'POST' }),

    getMe: () =>
        apiFetch('/auth/me', {
            credentials: 'include'
        }, true),

    getUserProfile: () =>
        apiFetch('/auth/profile', {}, true),

    refresh: () =>
        apiFetch('/auth/refresh', { method: 'POST' }),
}