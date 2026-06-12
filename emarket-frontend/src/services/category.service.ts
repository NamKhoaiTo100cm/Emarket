import { apiFetch } from "@/lib/api"

const categoryService = {
    getAll: () => apiFetch(`/category`, {}, true),
    getOne: (id: number) => apiFetch(`/category/${id}`, {}, true),
    create: (category: any) => apiFetch(`/category`, { method: 'POST', body: JSON.stringify(category) }),
    update: (id: number, category: any) => apiFetch(`/category/${id}`, { method: 'PATCH', body: JSON.stringify(category) }),
    delete: (id: number) => apiFetch(`/category/${id}`, { method: 'DELETE' }),
}

export default categoryService