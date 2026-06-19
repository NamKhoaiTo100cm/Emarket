'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { serverFetch } from '@/lib/serverApi';
import { cache } from 'react';

export async function loginAction(
    prevState: { error: string } | null,
    formData: FormData
) {
    const email = formData.get("email")
    const password = formData.get("password")
    let data: any;
    try {
        // serverFetch tự động throw Error khi !res.ok, nên chỉ cần try/catch
        data = await serverFetch('/auth/login', {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    } catch (error: any) {
        console.log(error)
        // Kiểm tra nếu lỗi là do 401 (sai email/mật khẩu)
        if (error?.status === 401) {
            return { error: "Sai email hoặc mật khẩu" }
        }
        return { error: "Đã xảy ra lỗi trong quá trình đăng nhập" }
    }

    // data ở đây là JSON object (access_token, refresh_token)
    if (!data?.access_token || !data?.refresh_token) {
        return { error: "Đăng nhập thất bại, vui lòng thử lại" }
    }

    const cookieStore = await cookies()
    cookieStore.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
    });
    cookieStore.set('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
    });
    redirect('/')
}

export async function logoutAction() {
    await serverFetch('/auth/logout', { method: 'POST' })
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
    redirect('/login')
}


// export async function getMe() {
//     try {
//         // Chỉ cần gọi hàm serverFetch, chuyện auth và refresh nó tự lo!
//         const data = await serverFetch('/auth/me', {
//             next: { revalidate: 60 }
//         });
//         console.log("getMe", data)
//         return data;
//     } catch (error) {
//         // Lỗi do hết phiên (chưa đăng nhập hoặc refresh thất bại)
//         return null;
//     }
// }

export const getMe = async () => {
    try {
        const data = await serverFetch('/auth/me');
        console.log("getMe", data)
        return data;
    } catch (error) {
        return null;
    }
}

export async function registerAction(
    prevState: { error: string } | null,
    formData: FormData
) {
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")?.toString().trim() || undefined;
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (password !== confirmPassword) {
        return { error: "Password không khớp" }
    }
    try {
        await serverFetch('/users', {
            method: "POST",
            body: JSON.stringify({ email, password, name, phone }),
        })
    } catch (error: any) {
        if (error?.status === 409) {
            return { error: "Email đã được đăng ký" }
        }
        return { error: error.message || "Đã xảy ra lỗi trong quá trình đăng ký" }
    }
    redirect('/login?registered=true')
}