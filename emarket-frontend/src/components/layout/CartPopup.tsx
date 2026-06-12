"use client"
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useProductsByIds } from '../hooks/useProduct';
import Image from 'next/image';

const CartPopup = () => {
    const removeProductsInCart = useCartStore(state => state.removeFromCart);
    const productItems = useCartStore(state => state.productItems);
    const productIds: number[] = [...new Set(productItems.map(item => item.id))];

    const { data: res, isLoading } = useProductsByIds(productIds);

    const [productsMap, setProductsMap] = useState<Record<number, any>>({});

    useEffect(() => {
        if (res?.data) {
            const map: Record<number, any> = {};
            res.data.forEach((p: any) => { map[p.id] = p; });
            setProductsMap(map);
        }
    }, [res]);

    return (
        <div className='bg-background px-4 py-3 rounded-2xl flex flex-col'>
            <h1 className='font-semibold mb-2'>Giỏ hàng ({productItems.length})</h1>
            <ScrollArea className='w-75 h-75 border rounded-lg'>
                <div className='p-1 gap-2'>
                    {productItems.length === 0 &&
                        <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
                            Chưa thêm sản phẩm nào trong giỏ hàng
                        </div>
                    }
                    {productItems.map((cartItem) => {
                        const product = productsMap[cartItem.id];
                        const key = `${cartItem.id}-${cartItem.variantId ?? 'base'}`;

                        // Fallback to API variant info when localStorage lacks it
                        const apiVariant = cartItem.variantId
                            ? product?.variants?.find((v: any) => v.id === cartItem.variantId)
                            : null;
                        const variantName = cartItem.variantName ?? apiVariant?.name;
                        const effectivePrice = cartItem.variantPrice ?? (apiVariant ? Number(apiVariant.price) : Number(product?.price ?? 0));

                        return (
                            <div key={key}>
                                <div className='rounded-lg p-2 flex gap-2 items-center'>
                                    <Image
                                        src={product?.images?.[0]?.imageUrl || "/iphone-17-pro-max.webp"}
                                        alt={product?.name ?? ''}
                                        width={48}
                                        height={48}
                                        className='rounded-md object-cover flex-shrink-0'
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium truncate'>{product?.name ?? `Sản phẩm #${cartItem.id}`}</p>
                                        {variantName && (
                                            <p className='text-xs text-muted-foreground'>
                                                Loại: <span className='font-medium'>{variantName}</span>
                                            </p>
                                        )}
                                        <p className='text-xs text-orange-500 font-semibold'>
                                            {effectivePrice.toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>
                                    <Button
                                        size='sm'
                                        variant='ghost'
                                        className='text-destructive'
                                        onClick={() => removeProductsInCart(cartItem.id, cartItem.variantId)}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                                <Separator />
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    )
}

export default CartPopup