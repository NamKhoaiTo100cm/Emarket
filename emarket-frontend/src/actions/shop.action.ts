import { serverFetch } from "@/lib/serverApi";
export const getShop = async (id: number) => {
    const res = await serverFetch(`/shop/${id}`, {
        method: "GET",
    });
    const data = res.data;
    return data;
}
export const createShop = async (shop: any) => {
    const res = await serverFetch('/shop', {
        method: 'POST',
        body: JSON.stringify(shop)
    })
    return res;
}
export const updateShop = async (id: number, shop: any) => {
    const res = await serverFetch(`/shop/${id}`, {
        method: 'PUT',
        body: JSON.stringify(shop)
    })
    return res;
}
export const deleteShop = async (id: number) => {
    const res = await serverFetch(`/shop/${id}`, {
        method: 'DELETE',
    })
    return res;
}