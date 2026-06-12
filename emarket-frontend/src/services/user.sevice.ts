import { apiFetch } from "@/lib/api";

export const userService = {
    getAllUsers: (roles?: string[]) => {
        const params = new URLSearchParams();
        roles?.forEach(r => params.append('role', r));
        const query = params.toString();
        return apiFetch(`/users${query ? `?${query}` : ''}`);
    },
    getProfile: () => apiFetch('/users/profile'),
    updateProfile: (data: FormData) => apiFetch('/users/profile', {
        method: 'PATCH',
        body: data,
    }),
    updateStatus: (id: number, status: 'active' | 'banned') => apiFetch(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status }),
    }),
    createStaff: (data: any) => apiFetch('/users/staff', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deleteUser: (id: number) => apiFetch(`/users/${id}`, {
        method: 'DELETE',
    }),
    getUserAddress: () => apiFetch('/addresses'),
    createUserAddress: (address: any) => apiFetch('/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
    }),
    updateUserAddress: (id: number, address: any) => apiFetch(`/addresses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(address),
    }),
    deleteUserAddress: (id: number) => apiFetch(`/addresses/${id}`, {
        method: 'DELETE',
    }),
}