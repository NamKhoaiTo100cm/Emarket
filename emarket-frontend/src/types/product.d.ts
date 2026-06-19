export type ProductVariant = {
    id: number;
    productId: number;
    name: string;
    price: number;
    salePrice?: number | null;
    stock: number;
    sortOrder: number;
}

export type ProductItems = {
    id: number,
    name: string,
    price: number,
    soldCount: number,
    reviewCount: number,
    description: string,
    salePrice: number,
    stock: number,
    ranking: number,
    shopId: number,
    variants?: ProductVariant[],
    status?: string,
}