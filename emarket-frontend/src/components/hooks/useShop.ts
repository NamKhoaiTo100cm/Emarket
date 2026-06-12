import { productService } from "@/services/product.service";
import { shopService } from "@/services/shop.service";
import { useQuery } from "@tanstack/react-query";

export function useShops() {
    return useQuery({
        queryKey: ['shop'],
        queryFn: () => shopService.getAll().then(res => res.data),
        retry: 1,
        staleTime: 5 * 60 * 1000,
    })
}

export function useShop(id: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['shop', id],
        queryFn: () => shopService.getOne(id).then(res => res.data),
        retry: 1,
        staleTime: 5 * 60 * 1000,
        enabled: id !== 0 && enabled,
    })
}

export function useMyShop(userId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ['my-shop', userId],
        queryFn: () => shopService.getMyShop(userId),
        retry: 1,
        staleTime: 5 * 60 * 1000,
        enabled: userId !== 0 && enabled,
    })
}

export function useShopStatistics(startDate?: string, endDate?: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['shop-statistics', startDate, endDate],
        queryFn: () => shopService.getStatistics(startDate, endDate).then(res => res.data),
        retry: 1,
        staleTime: 1 * 60 * 1000,
        enabled,
    })
}

export function useAdminStatistics(startDate?: string, endDate?: string, enabled: boolean = true) {
    return useQuery({
        queryKey: ['admin-statistics', startDate, endDate],
        queryFn: () => shopService.getAdminStatistics(startDate, endDate).then(res => res.data),
        retry: 1,
        staleTime: 1 * 60 * 1000,
        enabled,
    })
}


