"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function serverFetch(
    endpoint: string,
    options?: RequestInit
) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    // =========================================================
    // BƯỚC 1: Đọc cookie từ incoming request (browser → Next.js)
    // cookies() đọc cookie mà browser đính kèm khi gọi lên server
    // Lưu ý: middleware đã refresh access_token nếu cần trước khi
    // đến đây, nên access_token ở đây phải là token còn hạn.
    // =========================================================
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    const refreshToken = cookieStore.get("refresh_token")?.value;

    // =========================================================
    // BƯỚC 2: Tạo headers cho outgoing request (Next.js → Backend)
    // Node.js KHÔNG tự gửi cookie như browser, phải set tay
    // =========================================================
    const headers = new Headers(options?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);

    // Chỉ set Content-Type JSON nếu body không phải FormData
    // FormData tự generate boundary trong Content-Type, set tay sẽ bị lỗi
    if (!(options?.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    // =========================================================
    // BƯỚC 3: Gọi backend lần đầu với access token hiện tại
    // =========================================================
    let res = await fetch(
        `${baseUrl}${endpoint}`,
        { ...options, headers, cache: "no-store" }
    );

    // =========================================================
    // BƯỚC 4: Nếu vẫn 401 (edge case: middleware không kịp refresh
    // hoặc token hết hạn trong khoảng thời gian rất ngắn)
    // → Thử refresh một lần để lấy token mới cho request này
    // KHÔNG set cookie ở đây vì cookieStore.set() trong render
    // phase không đáng tin cậy — middleware sẽ lo ở request sau.
    // =========================================================
    if (res.status === 401 && refreshToken) {

        const refreshRes = await fetch(
            `${baseUrl}/auth/refresh`,
            {
                method: "POST",
                headers: { Cookie: `refresh_token=${refreshToken}` },
            }
        );

        // Refresh thất bại (refresh token hết hạn / invalid)
        // → đuổi user về trang login
        if (!refreshRes.ok) {
            redirect("/login?error=expired");
        }

        // Lấy access token mới từ Set-Cookie header
        const setCookie = refreshRes.headers.get("set-cookie");
        const newAccess = setCookie?.match(/access_token=([^;]+)/)?.[1];

        if (newAccess) {
            headers.set("Authorization", `Bearer ${newAccess}`);
            // Cố gắng persist cookie mới về browser:
            // - Trong Server Action context (form/button submit): HOẠT ĐỘNG ✅
            // - Trong render phase (Server Component): Next.js có thể throw
            //   → silent ignore, middleware sẽ lo ở lần navigate tiếp theo
            // try {
            //     cookieStore.set("access_token", newAccess, {
            //         httpOnly: true,
            //         path: "/",
            //         maxAge: 15 * 60,
            //         sameSite: "lax",
            //         secure: process.env.NODE_ENV === "production",
            //     });
            // } catch (error) {
            //     // render phase không cho set cookie — middleware sẽ xử lý
            //     console.log("set cookie failed in render phase", error)
            // }
            res = await fetch(
                `${baseUrl}${endpoint}`,
                { ...options, headers, cache: "no-store" }
            );
        }
    }

    // =========================================================
    // BƯỚC 5: Xử lý response lỗi (4xx, 5xx trừ 401 đã xử lý trên)
    // =========================================================
    if (!res.ok) {
        let errorMessage = "Lỗi không xác định";
        try {
            const error = await res.json();
            errorMessage = error.message || errorMessage;
        } catch { }
        throw Object.assign(new Error(errorMessage), { status: res.status });
    }

    // =========================================================
    // BƯỚC 6: Trả về data
    // =========================================================
    return res.json();
}