// app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AuthCallbackPage(props: {
    searchParams: SearchParams
}) {
    const searchParams = await props.searchParams;
    const accessToken = searchParams.access_token;
    const refreshToken = searchParams.refresh_token;

    if (accessToken && refreshToken) {
        const cookieStore = await cookies();
        cookieStore.set('access_token', accessToken as string, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
        });
        cookieStore.set('refresh_token', refreshToken as string, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });
        redirect('/');
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) redirect('/login?error=oauth_failed');

    redirect('/');
}