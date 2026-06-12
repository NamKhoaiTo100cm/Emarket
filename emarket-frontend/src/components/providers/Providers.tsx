// components/Providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
export default function Providers({ children, initialUser }: {
    children: React.ReactNode,
    initialUser?: any;
}) {
    const queryClient = new QueryClient();


    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}