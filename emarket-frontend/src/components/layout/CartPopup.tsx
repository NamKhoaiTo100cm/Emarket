"use client"
import { useCartStore } from '@/stores/useCartStore'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const CartPopup = () => {
    const removeFromCart = useCartStore(state => state.removeFromCart);
    const productItems = useCartStore(state => state.productItems);

    return (
        <div className='bg-background px-4 py-3 rounded-2xl flex flex-col'>
            <h1 className='font-semibold mb-2'>Giỏ hàng ({productItems.length})</h1>
            <ScrollArea className='w-75 h-75 border rounded-lg'>
                <div className='p-1 gap-2'>
                    {productItems.length === 0 && (
                        <div className='flex items-center justify-center h-32 text-muted-foreground text-sm'>
                            Chưa thêm sản phẩm nào trong giỏ hàng
                        </div>
                    )}
                    {productItems.map((cartItem) => {
                        const key = `${cartItem.id}`;
                        const product = cartItem.product;
                        const variant = cartItem.variant;

                        // Tính giá hiệu dụng
                        const effectivePrice = variant
                            ? (variant.salePrice && Number(variant.salePrice) > 0 ? Number(variant.salePrice) : Number(variant.price))
                            : (product?.salePrice && Number(product.salePrice) > 0 ? Number(product.salePrice) : Number(product?.price ?? 0));

                        return (
                            <div key={key}>
                                <div className='rounded-lg p-2 flex gap-2 items-center'>
                                    <Image
                                        src={product?.images?.[0]?.imagePath || "/image-not-found.jpg"}
                                        alt={product?.name ?? ''}
                                        width={48}
                                        height={48}
                                        className='rounded-md object-cover flex-shrink-0'
                                    />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-medium truncate'>{product?.name ?? `Sản phẩm #${cartItem.productId}`}</p>
                                        {variant && (
                                            <p className='text-xs text-muted-foreground'>
                                                Loại: <span className='font-medium'>{variant.name}</span>
                                            </p>
                                        )}
                                        <p className='text-xs text-muted-foreground'>x{cartItem.quantity}</p>
                                        <p className='text-xs text-orange-500 font-semibold'>
                                            {effectivePrice.toLocaleString('vi-VN')}đ
                                        </p>
                                    </div>
                                    <Button
                                        size='sm'
                                        variant='ghost'
                                        className='text-destructive'
                                        onClick={() => removeFromCart(cartItem.id)}
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