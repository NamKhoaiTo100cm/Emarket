import { productService } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

export function useProducts(page: number, limit: number, keyword: string = "", minRating: number = 0, categorySlug: string = "", minPrice?: number, maxPrice?: number, sortByPrice?: string) {
    return useQuery({
        queryKey: ['products', keyword, page, limit, minRating, categorySlug, minPrice, maxPrice, sortByPrice],
        queryFn: () => productService.getAll(page, limit, keyword, minRating, categorySlug, minPrice, maxPrice, undefined, sortByPrice),
        retry: 1,
        staleTime: 5 * 60 * 1000,
    })
}

export function useProductsByIds(ids: number[]) {
    return useQuery({
        queryKey: ['products-list', ids],
        queryFn: () => productService.getByIds(ids),
        retry: 1,
        staleTime: 0, // always fresh — cart needs up-to-date variant info
    })
}

export function useProductDetail(id: number) {

    return useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getOne(id).then(res => res.data),
        retry: 1,
        staleTime: 5 * 60 * 1000,

    })
}