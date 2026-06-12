import { create } from "zustand"

type ItemRequest = {
    productId: number,
    shopId: number,
    productName: string,
    shopName?: string,      // optional
    productImage?: string,  // optional
    quantity: number,
    price: string,
    variantId?: number,    // optional — khi mua sản phẩm có loại
    variantName?: string,  // optional — tên variant
}
type CheckoutStore = {
    checkoutProductData: ItemRequest[]
    setCheckoutData: (data: ItemRequest[]) => void
    clearCheckoutData: () => void
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
    checkoutProductData: [],
    setCheckoutData: (data: ItemRequest[]) => {
        console.log("data store checkout" + data)
        set({ checkoutProductData: data })
    },
    clearCheckoutData: () =>
        set({ checkoutProductData: [] }),
}))