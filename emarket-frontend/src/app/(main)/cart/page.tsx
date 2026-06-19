"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/useCartStore';
import { useCheckoutStore } from '@/stores/useCheckoutStore';
import { CartItem } from '@/types/cartstore';
import { ArrowRight, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner';

const CartPage = () => {
    const router = useRouter();
    const productItems = useCartStore(state => state.productItems);
    const removeFromCart = useCartStore(state => state.removeFromCart);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const loading = useCartStore(state => state.loading);
    const setCheckoutData = useCheckoutStore(state => state.setCheckoutData);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelect = (id: number, name: string) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(k => k !== id);
            toast.success(`Đã chọn ${name}`);
            return [...prev, id];
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? productItems.map(i => i.id) : []);
    };

    const selectedItems = productItems.filter(i => selectedIds.includes(i.id));

    const getEffectivePrice = (item: CartItem) => {
        const variant = item.variant;
        const product = item.product;
        if (variant) {
            return variant.salePrice && Number(variant.salePrice) > 0
                ? Number(variant.salePrice)
                : Number(variant.price);
        }
        return product?.salePrice && Number(product.salePrice) > 0
            ? Number(product.salePrice)
            : Number(product?.price ?? 0);
    };

    const getStock = (item: CartItem) => {
        return item.variant ? item.variant.stock ?? 0 : item.product?.stock ?? 0;
    };

    const subTotal = useMemo(
        () => selectedItems.reduce((sum, i) => sum + getEffectivePrice(i) * i.quantity, 0),
        [selectedItems]
    );

    const handleChangeQty = (item: CartItem, delta: number) => {
        const stock = getStock(item);
        const newQty = Math.max(1, Math.min(stock, item.quantity + delta));
        updateQuantity(item.id, newQty);
    };

    const onClickBtnBuy = () => {
        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn sản phẩm");
            return;
        }
        setCheckoutData(selectedItems.map(item => ({
            productId: item.productId,
            shopId: item.product?.shopId ?? 0,
            shopName: item.product?.shop?.name,
            productName: item.product?.name ?? '' + (item.variant ? ` (${item.variant.name})` : ''),
            quantity: item.quantity,
            price: getEffectivePrice(item).toString(),
            productImage: item.product?.images?.[0]?.imagePath ?? '',
            variantId: item.variantId ?? undefined,
            variantName: item.variant?.name,
        })));
        router.push("/checkout");
    };

    const allSelected = productItems.length > 0 && selectedIds.length === productItems.length;

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-150 mt-13.75'>
                <div className='flex flex-col items-center gap-3'>
                    <ShoppingCart className='size-12 animate-pulse text-muted-foreground' />
                    <p className='text-muted-foreground'>Đang tải giỏ hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='p-2 mt-13.75 min-h-150 md:mx-8'>
            {/* title */}
            <div className='flex gap-3 items-end mb-4'>
                <ShoppingCart className='size-10' />
                <h1 className='text-3xl font-semibold'>Giỏ hàng của bạn</h1>
                <span className='text-muted-foreground'>({productItems.length} sản phẩm)</span>
            </div>

            {productItems.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground'>
                    <ShoppingCart className='size-16 opacity-30' />
                    <p className='text-lg'>Giỏ hàng trống</p>
                    <Button onClick={() => router.push('/')}>Tiếp tục mua sắm</Button>
                </div>
            ) : (
                <div className='mt-2 flex flex-wrap gap-3 justify-between'>
                    {/* Cart Items */}
                    <div className='flex flex-col gap-3 w-full lg:w-[60%]'>
                        {/* Select all */}
                        <Card className='px-4 py-3 flex-row items-center gap-2'>
                            <Checkbox
                                id="select-all"
                                checked={allSelected}
                                onCheckedChange={handleSelectAll}
                            />
                            <Label htmlFor="select-all" className='cursor-pointer'>Chọn tất cả</Label>
                        </Card>

                        {productItems.map((item) => {
                            const price = getEffectivePrice(item);
                            const stock = getStock(item);
                            const isSelected = selectedIds.includes(item.id);

                            return (
                                <Card
                                    key={item.id}
                                    className={cn(
                                        'px-4 py-3 transition-all',
                                        isSelected && 'border-primary border-2'
                                    )}
                                >
                                    <div className='flex gap-3'>
                                        {/* Checkbox */}
                                        <div className='flex items-center'>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(item.id, item.product?.name ?? '')}
                                            />
                                        </div>

                                        {/* Image */}
                                        <Image
                                            src={item.product?.images?.[0]?.imagePath || "/image-not-found.jpg"}
                                            width={96}
                                            height={96}
                                            alt={item.product?.name ?? ''}
                                            className='w-24 h-24 object-cover rounded-md border flex-shrink-0'
                                        />

                                        {/* Info */}
                                        <div className='flex flex-1 justify-between flex-wrap gap-2'>
                                            <div className='flex flex-col gap-1 min-w-0'>
                                                <h1 className='font-semibold text-base line-clamp-2'>{item.product?.name}</h1>
                                                {item.variant && (
                                                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                                        <Tag className='size-3' />
                                                        <span>Phân loại: <span className='font-medium text-foreground'>{item.variant.name}</span></span>
                                                    </div>
                                                )}
                                                <p className='text-sm text-green-600'>Còn {stock} sản phẩm</p>
                                                {/* Quantity controls */}
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <Button
                                                        size='icon'
                                                        variant='outline'
                                                        className='h-7 w-7'
                                                        onClick={() => handleChangeQty(item, -1)}
                                                        disabled={item.quantity <= 1}
                                                    >-</Button>
                                                    <span className='w-8 text-center font-medium'>{item.quantity}</span>
                                                    <Button
                                                        size='icon'
                                                        variant='outline'
                                                        className='h-7 w-7'
                                                        onClick={() => handleChangeQty(item, 1)}
                                                        disabled={item.quantity >= stock}
                                                    >+</Button>
                                                </div>
                                            </div>

                                            <div className='flex flex-col items-end justify-between'>
                                                <Button
                                                    variant="ghost"
                                                    size='icon'
                                                    className='text-destructive hover:bg-destructive/10'
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className='size-4' />
                                                </Button>
                                                <div className='text-right'>
                                                    <p className='font-bold text-lg text-orange-500'>
                                                        {(price * item.quantity).toLocaleString("vi-VN")}đ
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className='text-xs text-muted-foreground'>
                                                            {price.toLocaleString("vi-VN")}đ / sản phẩm
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <Card className='w-full lg:w-[35%] h-fit sticky top-20'>
                        <CardHeader>
                            <h1 className='font-semibold text-xl'>Thông tin đơn hàng</h1>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-3'>
                            {selectedItems.length === 0 ? (
                                <p className='text-muted-foreground text-sm'>Chưa chọn sản phẩm nào</p>
                            ) : (
                                <>
                                    {selectedItems.map(item => (
                                        <div key={item.id} className='flex justify-between text-sm'>
                                            <span className='truncate max-w-[60%]'>
                                                {item.product?.name}
                                                {item.variant && <span className='text-muted-foreground'> ({item.variant.name})</span>}
                                                <span className='ml-1 text-muted-foreground'>x{item.quantity}</span>
                                            </span>
                                            <span className='font-medium'>{(getEffectivePrice(item) * item.quantity).toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    ))}
                                    <div className='border-t pt-3 flex justify-between'>
                                        <span>Tạm tính</span>
                                        <span className='font-medium'>{subTotal.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className='flex justify-between text-muted-foreground text-sm'>
                                        <span>Phí vận chuyển</span>
                                        <span>Tính ở bước tiếp theo</span>
                                    </div>
                                    <div className='border-t pt-2 flex justify-between font-bold text-lg'>
                                        <span>Tổng cộng</span>
                                        <span className='text-orange-500'>{subTotal.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                </>
                            )}
                        </CardContent>
                        <CardFooter className='flex flex-col gap-2'>
                            <Button
                                className='w-full'
                                onClick={onClickBtnBuy}
                                disabled={selectedItems.length === 0}
                            >
                                Đặt mua ({selectedItems.length}) <ArrowRight />
                            </Button>
                            <Button variant="secondary" className='w-full' onClick={() => router.push('/')}>
                                Tiếp tục mua sắm
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default CartPage;