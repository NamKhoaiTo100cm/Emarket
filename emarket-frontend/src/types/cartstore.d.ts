import { ProductItems } from "./product";
// types/cartstore.ts
interface CartItem {
    id: number
    quantity: number
    variantId?: number
    variantName?: string
    variantPrice?: number
}

export interface CartStore {
    productItems: CartItem[]
    initCart: () => void
    addToCart: (id: number, variant?: { id: number; name: string; price: number }) => void
    removeFromCart: (id: number, variantId?: number) => void
    updateQuantity: (id: number, quantity: number, variantId?: number) => void
    clearCart: () => void
}
