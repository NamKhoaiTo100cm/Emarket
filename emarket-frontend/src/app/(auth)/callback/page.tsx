// app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AuthCallbackPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token');

    if (!token) redirect('/login?error=oauth_failed');

    redirect('/');
}