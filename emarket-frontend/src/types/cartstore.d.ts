// Thông tin 1 item trong giỏ hàng (từ server)
export interface CartItem {
    id: number          // cart item id (từ DB)
    productId: number
    variantId?: number | null
    quantity: number
    product?: {
        id: number
        name: string
        price: number
        salePrice?: number | null
        stock?: number
        shopId: number
        images?: { imagePath: string }[]
        shop?: { id: number; name: string; logo: string }
    }
    variant?: {
        id: number
        name: string
        price: number
        salePrice?: number | null
        stock?: number
    } | null
}

export interface CartStore {
    productItems: CartItem[]
    loading: boolean
    initCart: () => Promise<void>
    addToCart: (
        productId: number,
        variant?: { id: number; name: string; price: number },
        isLoggedIn?: boolean,
        redirectToLogin?: () => void,
    ) => Promise<void>
    removeFromCart: (cartItemId: number) => Promise<void>
    updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
    clearCart: () => Promise<void>
}
