"use client"
import { useMe } from '@/components/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { productService } from '@/services/product.service';
import { useCartStore } from '@/stores/useCartStore';
import { useCheckoutStore } from '@/stores/useCheckoutStore';
import { ProductItems } from '@/types/product';
import { ArrowRight, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner';

// CartItem augmented with fetched product info
type CartItemWithProduct = {
    cartId: string; // composite key: productId-variantId
    productId: number;
    variantId?: number;
    variantName?: string;
    variantPrice?: number;
    quantity: number;
    productName: string;
    productImage: string;
    shopId: number;
    shopName?: string;
    price: number; // effective price (variant price if variant, otherwise product price)
    stock: number;
}

const CartPage = () => {
    const router = useRouter();
    const productItems = useCartStore(state => state.productItems);
    const removeFromCart = useCartStore(state => state.removeFromCart);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const setCheckoutData = useCheckoutStore(state => state.setCheckoutData);

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [cartItemsWithProduct, setCartItemsWithProduct] = useState<CartItemWithProduct[]>([]);

    useEffect(() => {
        const productIds = [...new Set(productItems.map(item => item.id))];
        if (productIds.length === 0) {
            setCartItemsWithProduct([]);
            return;
        }
        const fetchProducts = async () => {
            const res = await productService.getByIds(productIds);
            if (!res?.data) return;

            const productMap: Record<number, any> = {};
            res.data.forEach((p: any) => { productMap[p.id] = p; });

            const enriched: CartItemWithProduct[] = productItems.map(cartItem => {
                const product = productMap[cartItem.id];
                if (!product) return null;
                const cartId = `${cartItem.id}-${cartItem.variantId ?? 'base'}`;

                // Tìm variant từ API nếu localStorage thiếu thông tin
                const apiVariant = cartItem.variantId
                    ? product.variants?.find((v: any) => v.id === cartItem.variantId)
                    : null;

                const variantName = cartItem.variantName ?? apiVariant?.name;
                const price = cartItem.variantPrice ?? (apiVariant ? Number(apiVariant.price) : Number(product.price));
                const stock = apiVariant ? Number(apiVariant.stock) : Number(product.stock);

                return {
                    cartId,
                    productId: cartItem.id,
                    variantId: cartItem.variantId,
                    variantName,
                    variantPrice: cartItem.variantPrice ?? (apiVariant ? Number(apiVariant.price) : undefined),
                    quantity: cartItem.quantity,
                    productName: product.name,
                    productImage: product.images?.[0]?.imageUrl || '',
                    shopId: product.shopId,
                    shopName: product.shop?.name || '',
                    price,
                    stock,
                };
            }).filter(Boolean) as CartItemWithProduct[];

            setCartItemsWithProduct(enriched);
        };
        fetchProducts();
    }, [productItems]);

    const toggleSelect = (cartId: string, name: string) => {
        setSelectedKeys(prev => {
            if (prev.includes(cartId)) return prev.filter(k => k !== cartId);
            toast.success(`Đã chọn ${name}`);
            return [...prev, cartId];
        });
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedKeys(checked ? cartItemsWithProduct.map(i => i.cartId) : []);
    };

    const selectedItems = cartItemsWithProduct.filter(i => selectedKeys.includes(i.cartId));

    const subTotal = useMemo(
        () => selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        [selectedItems]
    );

    const handleChangeQty = (item: CartItemWithProduct, delta: number) => {
        const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
        updateQuantity(item.productId, newQty, item.variantId);
    };

    const onClickBtnBuy = () => {
        if (selectedItems.length === 0) {
            toast.error("Vui lòng chọn sản phẩm");
            return;
        }
        setCheckoutData(selectedItems.map(item => ({
            productId: item.productId,
            shopId: item.shopId,
            shopName: item.shopName,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price.toString(),
            productImage: item.productImage,
            variantId: item.variantId,
            variantName: item.variantName,
        })));
        router.push("/checkout");
    };

    const allSelected = cartItemsWithProduct.length > 0 && selectedKeys.length === cartItemsWithProduct.length;

    return (
        <div className='p-2 mt-13.75 min-h-150 md:mx-8'>
            {/* title */}
            <div className='flex gap-3 items-end mb-4'>
                <ShoppingCart className='size-10' />
                <h1 className='text-3xl font-semibold'>Giỏ hàng của bạn</h1>
                <span className='text-muted-foreground'>({productItems.length} sản phẩm)</span>
            </div>

            {cartItemsWithProduct.length === 0 ? (
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

                        {cartItemsWithProduct.map((item) => (
                            <Card
                                key={item.cartId}
                                className={cn(
                                    'px-4 py-3 transition-all',
                                    selectedKeys.includes(item.cartId) && 'border-primary border-2'
                                )}
                            >
                                <div className='flex gap-3'>
                                    {/* Checkbox */}
                                    <div className='flex items-center'>
                                        <Checkbox
                                            checked={selectedKeys.includes(item.cartId)}
                                            onCheckedChange={() => toggleSelect(item.cartId, item.productName)}
                                        />
                                    </div>

                                    {/* Image */}
                                    <Image
                                        src={item.productImage || "/iphone-17-pro-max.webp"}
                                        width={96}
                                        height={96}
                                        alt={item.productName}
                                        className='w-24 h-24 object-cover rounded-md border flex-shrink-0'
                                    />

                                    {/* Info */}
                                    <div className='flex flex-1 justify-between flex-wrap gap-2'>
                                        <div className='flex flex-col gap-1 min-w-0'>
                                            <h1 className='font-semibold text-base line-clamp-2'>{item.productName}</h1>
                                            {item.variantName && (
                                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                                    <Tag className='size-3' />
                                                    <span>Phân loại: <span className='font-medium text-foreground'>{item.variantName}</span></span>
                                                </div>
                                            )}
                                            <p className='text-sm text-green-600'>
                                                Còn {item.stock} sản phẩm
                                            </p>
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
                                                    disabled={item.quantity >= item.stock}
                                                >+</Button>
                                            </div>
                                        </div>

                                        <div className='flex flex-col items-end justify-between'>
                                            <Button
                                                variant="ghost"
                                                size='icon'
                                                className='text-destructive hover:bg-destructive/10'
                                                onClick={() => removeFromCart(item.productId, item.variantId)}
                                            >
                                                <Trash2 className='size-4' />
                                            </Button>
                                            <div className='text-right'>
                                                <p className='font-bold text-lg text-orange-500'>
                                                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                                                </p>
                                                {item.quantity > 1 && (
                                                    <p className='text-xs text-muted-foreground'>
                                                        {item.price.toLocaleString("vi-VN")}đ / sản phẩm
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
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
                                        <div key={item.cartId} className='flex justify-between text-sm'>
                                            <span className='truncate max-w-[60%]'>
                                                {item.productName}
                                                {item.variantName && <span className='text-muted-foreground'> ({item.variantName})</span>}
                                                <span className='ml-1 text-muted-foreground'>x{item.quantity}</span>
                                            </span>
                                            <span className='font-medium'>{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
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