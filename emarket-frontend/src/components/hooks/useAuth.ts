import { queryClient } from "@/lib/queryClient";
import { authService } from "@/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


export function useMe() {
    return useQuery({
        queryKey: ['me'],
        queryFn: () => authService.getMe(),
        retry: 1,
        staleTime: 5 * 60 * 1000,
    })
}

export function useLogout() {
    const router = useRouter();
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: authService.logout,
        onSuccess: () => {
            queryClient.setQueryData(['me'], null);
            queryClient.clear();
            window.location.href = "/";
        },
        onError: (error) => {
            console.error("Logout failed:", error);
        }
    })
}