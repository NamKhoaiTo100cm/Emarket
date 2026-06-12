import { serverFetch } from "@/lib/serverApi";
import { ProductItems } from "@/types/product";

export const getProduct = async (id: number) => {
    const res = await serverFetch(`/product/${id}`, {
        method: "GET",

    });
    const data: ProductItems = await res.json();
    return data;
}
export const getProducts = async (page: number, limit: number, minRating: number = 0, keyword: string = "") => {
    const res = await serverFetch(`/product?page=${page}&limit=${limit}&minRating=${minRating}&keyword=${keyword}`, {
        method: "GET",

    });
    console.log("get data")
    // const data: ProductItems = await res.json();
    return res.data;
}
export const getProductsByShopId = async (shopId: number, page: number = 1, limit: number = 10) => {
    const res = await serverFetch(`/product/shop/${shopId}?page=${page}&limit=${limit}`, {
        method: 'GET',
    });
    return res.data;
}
export const createProduct = async (product: any) => {
    const res = await serverFetch('/product', {
        method: 'POST',
        body: JSON.stringify(product)
    })
    return res;
}