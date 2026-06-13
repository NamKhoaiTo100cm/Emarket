import { redirect } from "next/navigation"


export async function apiFetch(endpoint: string, options?: RequestInit, isPublic: boolean = false) {
    const isFormData = options?.body instanceof FormData
    console.log('isFormData:', isFormData)
    console.log('body:', options?.body)

    const isClient = typeof window !== 'undefined';
    const baseUrl = isClient ? '/api' : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000');

    const buildHeaders = (opts?: RequestInit) => ({
        // Nếu là FormData thì KHÔNG set Content-Type, để browser tự set multipart boundary
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...opts?.headers,
    })

    let res = await fetch(`${baseUrl}${endpoint}`, {
        credentials: 'include',
        ...options,
        headers: buildHeaders(options),
    })

    // XỬ LÝ KHI ACCESS TOKEN HẾT HẠN
    if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
        try {
            // Cố gắng gọi API refresh token
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Bắt buộc để gửi refresh_token từ cookie
            });
            console.log("refreshRes", refreshRes)
            if (refreshRes.ok) {
                res = await fetch(`${baseUrl}${endpoint}`, {
                    credentials: 'include',
                    ...options,
                    headers: buildHeaders(options), // ← fix ở đây
                });
            } else {
                // Refresh thất bại -> Token hoàn toàn hết hạn -> Cần bắt login lại
                // (Có thể redirect user về trang /login ở đây)
                if (typeof window !== 'undefined' && isPublic === false) {
                    window.location.href = '/login';
                }
                throw new Error('Phiên đăng nhập đã hết hạn');
            }
        } catch (error) {
            throw error;
        }
    }

    if (!res.ok) {
        const error = await res.json();
        throw Object.assign(new Error(error.message || 'Lỗi không xác định'), { status: 500 });
        return error;
    }

    return res.json()
}
