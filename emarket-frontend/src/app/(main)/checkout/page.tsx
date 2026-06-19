"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { orderService } from '@/services/order.service'
import { paymentService } from '@/services/payment.service'
import { userService } from '@/services/user.sevice'
import { voucherService } from '@/services/voucher.service'
import { useCartStore } from '@/stores/useCartStore'
import { useCheckoutStore } from '@/stores/useCheckoutStore'
import { CreditCard, Pencil, ShoppingCart, Trash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FaCcMastercard, FaCcVisa, FaMoneyBill } from 'react-icons/fa'
import { GiMoneyStack } from 'react-icons/gi'
import { toast } from 'sonner'

type ItemRequest = {
    productId: number,
    shopId: number,
    productName: string,
    quantity: number,
    price: string,
    variantId?: number,
    variantName?: string,
    productImage?: string,
}
type PaymentRequestConfirmed = {
    userId: number,
    shopId: number,
    shippingAddress: string,
    receiverName: string,
    receiverPhone: string,
    paymentMethod: string,
    items: ItemRequest[]
};
interface UserAddress {
    id: number;
    userId: number;
    receiverName: string;
    receiverPhone: string;
    province: string;
    district: string;
    ward: string;
    addressLine: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

const CheckOutPage = () => {
    const router = useRouter();
    const [paymentMethodSelected, setPaymentMethodSelected] = useState("momo");
    const productCheckOut = useCheckoutStore(state => state.checkoutProductData);
    const clearCheckoutData = useCheckoutStore(state => state.clearCheckoutData);
    const clearCart = useCartStore(state => state.clearCart);
    const [shippingMethodSelected, setShippingMethodSelected] = useState("standard");
    const [subTotal, setSubTotal] = useState(0);
    const [orderTotal, setOrderTotal] = useState(0);
    const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [selectedAddress, setSelectedAddress] = useState({
        addressLine: "",
        province: "",
        district: "",
        ward: "",
        receiverName: "",
        receiverPhone: "",
    });
    const [dialogAddressOpen, setDialogAddressOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
    const [shopVoucherCodes, setShopVoucherCodes] =
        useState<Record<number, string>>({});

    const [shopDiscounts, setShopDiscounts] =
        useState<Record<number, number>>({});

    const groupedProducts = Object.groupBy(
        productCheckOut,
        item => item.shopId
    );
    const [formAddressData, setFormAddressData] = useState({
        receiverName: "",
        receiverPhone: "",
        province: "",
        district: "",
        ward: "",
        addressLine: "",
        isDefault: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormAddressData({
            ...formAddressData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const resetFormAddress = () => {
        setFormAddressData({
            receiverName: "",
            receiverPhone: "",
            province: "",
            district: "",
            ward: "",
            addressLine: "",
            isDefault: false,
        });
        setEditingAddressId(null);
    };

    const openAddAddressDialog = () => {
        resetFormAddress();
        setDialogAddressOpen(true);
    };

    const openEditAddressDialog = (address: UserAddress) => {
        setEditingAddressId(address.id);
        setFormAddressData({
            receiverName: address.receiverName,
            receiverPhone: address.receiverPhone,
            province: address.province,
            district: address.district,
            ward: address.ward,
            addressLine: address.addressLine,
            isDefault: address.isDefault,
        });
        setDialogAddressOpen(true);
    };

    const handleAddressSubmit = async () => {
        if (editingAddressId) {
            // Cập nhật địa chỉ
            const res = await userService.updateUserAddress(editingAddressId, formAddressData);
            if (res.statusCode === 200) {
                toast.success(res.message);
                await loadUserAddresses();
                setDialogAddressOpen(false);
                resetFormAddress();
            } else {
                toast.error(res.message);
            }
        } else {
            // Thêm địa chỉ mới
            const res = await userService.createUserAddress(formAddressData);
            if (res.statusCode === 201) {
                toast.success(res.message);
                await loadUserAddresses();
                setDialogAddressOpen(false);
                resetFormAddress();
            } else {
                toast.error(res.message);
            }
        }
    };

    const loadUserAddresses = async () => {
        const res = await userService.getUserAddress();
        setUserAddresses(res.data);
    };

    const totalShopDiscount =
        Object.values(shopDiscounts)
            .reduce((sum, item) => sum + item, 0);
    console.log("pd ck" + productCheckOut);

    useEffect(() => {
        const total = productCheckOut.reduce(
            (acc, item) =>
                acc +
                Number(item.price) * item.quantity,
            0
        );

        setSubTotal(total);
    }, [productCheckOut]);

    useEffect(() => {
        loadUserAddresses();
    }, []);

    // Xử lý khi userAddresses thay đổi để set selected address mặc định
    useEffect(() => {
        if (userAddresses.length > 0) {
            const defaultAddress = userAddresses.find(address => address.isDefault);
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id.toString());
                setSelectedAddress({
                    addressLine: defaultAddress.addressLine,
                    province: defaultAddress.province,
                    district: defaultAddress.district,
                    ward: defaultAddress.ward,
                    receiverName: defaultAddress.receiverName,
                    receiverPhone: defaultAddress.receiverPhone,
                });
            } else if (userAddresses[0]) {
                // Nếu không có địa chỉ mặc định, chọn địa chỉ đầu tiên
                setSelectedAddressId(userAddresses[0].id.toString());
                setSelectedAddress({
                    addressLine: userAddresses[0].addressLine,
                    province: userAddresses[0].province,
                    district: userAddresses[0].district,
                    ward: userAddresses[0].ward,
                    receiverName: userAddresses[0].receiverName,
                    receiverPhone: userAddresses[0].receiverPhone,
                });
            }
        }
    }, [userAddresses]);

    // Phí vận chuyển theo phương thức
    const SHIPPING_FEE: Record<string, number> = {
        standard: 30000,
        express: 50000,
        same_day: 80000,
    };
    const shippingFee = SHIPPING_FEE[shippingMethodSelected] ?? 30000;

    useEffect(() => {
        const totalShopDiscount =
            Object.values(shopDiscounts)
                .reduce((sum, item) => sum + item, 0);

        setOrderTotal(subTotal + shippingFee - totalShopDiscount);

    }, [subTotal, shopDiscounts, shippingFee]);

    const onApplyShopVoucher = async (
        shopId: number,
        orderTotal: number
    ) => {

        const code =
            shopVoucherCodes[shopId];

        if (!code) {
            toast.error("Nhập mã voucher");
            return;
        }

        try {
            const result =
                await voucherService.validateShopVoucher({
                    code,
                    orderTotal,
                    shopId
                });
            // validateShopVoucher: (data: any) => apiFetch(`/voucher/validate/shop?code=${data.code}&orderTotal=${data.orderTotal}&shopId=${data.shopId}`)

            if (result.statusCode === 200) {

                setShopDiscounts(prev => ({
                    ...prev,
                    [shopId]:
                        result.data.discountAmount
                }));

                toast.success(
                    result.message
                );

            } else {

                toast.error(
                    result.message || "Áp dụng voucher thất bại"
                );
            }
        } catch (error: any) {
            toast.error(error.message || "Voucher không hợp lệ hoặc không tồn tại");
        }
    };

    const onCheckoutBtnClick = async () => {
        const groupOrderByShop = Object.groupBy(productCheckOut, item => item.shopId);

        if (Object.keys(groupOrderByShop).length === 0) {
            toast.error("Không có sản phẩm nào được chọn");
            return;
        }

        if (!selectedAddress.receiverName || !selectedAddress.addressLine) {
            toast.error("Vui lòng chọn hoặc thêm địa chỉ nhận hàng");
            return;
        }

        try {
            const ordersResult = await Promise.all(
                Object.values(groupOrderByShop).map(async (items) => {
                    const shippingAddressStr = `${selectedAddress.addressLine}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`;
                    return orderService.createOrder({
                        shippingAddress: shippingAddressStr,
                        receiverName: selectedAddress.receiverName,
                        receiverPhone: selectedAddress.receiverPhone,
                        paymentMethod: paymentMethodSelected,
                        shippingMethod: shippingMethodSelected,
                        items: items?.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            variantId: item.variantId,
                        })),
                        shopVoucherCode: shopVoucherCodes[Number(items?.[0].shopId)],
                    });
                })
            );

            const failed = ordersResult.find(res => res.statusCode !== 201);
            if (failed) {
                toast.error(failed.message);
                return;
            }

            const orderIds: number[] = ordersResult.map(res => res.data.id);

            // Xóa sản phẩm khỏi giỏ hàng sau khi đặt thành công
            if (paymentMethodSelected === 'momo') {
                const res = await paymentService.createMomoPayment(orderIds);
                window.location.href = res.data.payUrl;
            } else {
                // COD: xóa cart và redirect đến trang đơn hàng
                clearCart();
                clearCheckoutData();
                toast.success("Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận sớm.");
                router.push(`/user/orders`);
            }
        } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra, thử lại sau");
        }
    };

    return (
        <div className='p-2 mt-13.75 min-h-150 md:mx-8'>
            {/* title */}
            <div className='flex gap-3 items-end'>
                <ShoppingCart className='size-10' /><h1 className='text-3xl font-semibold'>Xác nhận thông tin đặt hàng</h1><h1>{productCheckOut.length} sản phẩm</h1>
            </div>
            <div className="flex flex-wrap justify-between">
                <div className="md:w-[60%]">
                    <h1 className="font-semibold mt-4">Thông tin địa chỉ nhận hàng</h1>
                    <RadioGroup
                        value={selectedAddressId}
                        onValueChange={(value) => {
                            setSelectedAddressId(value);
                            const address = userAddresses.find(address => String(address.id) === value);
                            if (address) {
                                setSelectedAddress({
                                    addressLine: address.addressLine,
                                    province: address.province,
                                    district: address.district,
                                    ward: address.ward,
                                    receiverName: address.receiverName,
                                    receiverPhone: address.receiverPhone,
                                });
                            }
                        }}
                    >
                        {
                            userAddresses && userAddresses.length > 0 ? (
                                userAddresses.map((address, index) => {
                                    return (
                                        <Card key={address.id} className="gap-1.5 mb-3">
                                            <CardHeader className="">
                                                <div className="flex flex-row justify-between">
                                                    <div className="flex gap-2">
                                                        <RadioGroupItem value={String(address.id)} id={`address-${address.id}`} />
                                                        <CardTitle className="">
                                                            {address.isDefault && <span className="text-primary font-semibold">(Mặc định)</span>}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="icon" onClick={async () => {
                                                            const res = await userService.deleteUserAddress(address.id);
                                                            if (res.statusCode === 200) {
                                                                toast.success(res.message);
                                                                await loadUserAddresses();
                                                            } else {
                                                                toast.error(res.message);
                                                            }
                                                        }}>
                                                            <Trash />
                                                        </Button>
                                                        <Button variant="outline" size="icon" onClick={() => openEditAddressDialog(address)}>
                                                            <Pencil />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex gap-2 font-semibold">
                                                    <h1>{address.receiverName}</h1>
                                                    <h1>{address.receiverPhone}</h1>
                                                </div>
                                                <h1>{address.province}, {address.district}, {address.ward}, {address.addressLine}</h1>
                                            </CardContent>
                                        </Card>
                                    )
                                })
                            ) : (
                                <>
                                    <h1>Chưa có địa chỉ</h1>
                                </>
                            )
                        }
                    </RadioGroup>
                    <Button onClick={openAddAddressDialog} disabled={userAddresses?.length >= 5}>{userAddresses?.length >= 5 ? "Đã đạt số lượng địa chỉ tối đa" : "Thêm địa chỉ"}</Button>

                    {/* Dialog thêm/sửa địa chỉ */}
                    <Dialog open={dialogAddressOpen} onOpenChange={(open) => {
                        if (!open) resetFormAddress();
                        setDialogAddressOpen(open);
                    }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingAddressId ? "Sửa địa chỉ" : "Thêm địa chỉ"}</DialogTitle>
                                <DialogDescription>
                                    {editingAddressId ? "Chỉnh sửa thông tin địa chỉ giao hàng" : "Thêm địa chỉ giao hàng mới"}
                                </DialogDescription>
                            </DialogHeader>
                            <Field>
                                <Label>Tên người nhận</Label>
                                <Input
                                    onChange={handleChange}
                                    name='receiverName'
                                    value={formAddressData.receiverName}
                                />
                            </Field>
                            <Field>
                                <Label>Số điện thoại</Label>
                                <Input
                                    onChange={handleChange}
                                    name='receiverPhone'
                                    value={formAddressData.receiverPhone}
                                />
                            </Field>
                            <Field>
                                <Label>Tỉnh/Thành phố</Label>
                                <Input
                                    onChange={handleChange}
                                    name='province'
                                    value={formAddressData.province}
                                />
                            </Field>
                            <Field>
                                <Label>Quận/Huyện</Label>
                                <Input
                                    onChange={handleChange}
                                    name='district'
                                    value={formAddressData.district}
                                />
                            </Field>
                            <Field>
                                <Label>Phường/Xã</Label>
                                <Input
                                    onChange={handleChange}
                                    name='ward'
                                    value={formAddressData.ward}
                                />
                            </Field>
                            <Field>
                                <Label>Địa chỉ cụ thể</Label>
                                <Input
                                    onChange={handleChange}
                                    name='addressLine'
                                    value={formAddressData.addressLine}
                                />
                            </Field>
                            <div className="flex flex-row items-center gap-2">
                                <Checkbox
                                    checked={formAddressData.isDefault}
                                    onCheckedChange={(checked) => setFormAddressData(prev => ({
                                        ...prev,
                                        isDefault: checked === true
                                    }))}
                                    className='w-5 h-5'
                                />
                                <Label>Đặt làm địa chỉ mặc định</Label>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    setDialogAddressOpen(false);
                                    resetFormAddress();
                                }}>Hủy</Button>
                                <Button onClick={handleAddressSubmit}>
                                    {editingAddressId ? "Cập nhật" : "Thêm"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <h1 className="font-semibold mt-4">Phương thức giao hàng</h1>
                    <div className="">
                        <RadioGroup className='grid sm:grid-cols-3 gap-2' defaultValue={shippingMethodSelected} onValueChange={setShippingMethodSelected}>
                            <Card className="gap-4">
                                <CardContent className="flex flex-row gap-3">
                                    <RadioGroupItem value="standard" id="standard" />
                                    <CardTitle>Tiêu chuẩn 🐢</CardTitle>
                                </CardContent>
                                <CardContent className="text-centers">
                                    5-7 ngày · <span className="font-semibold">30.000 đ</span>
                                </CardContent>
                            </Card>
                            <Card className="gap-4">
                                <CardContent className="flex flex-row gap-3">
                                    <RadioGroupItem value="express" id="express" />
                                    <CardTitle>Nhanh 🚶‍♂️‍➡️</CardTitle>
                                </CardContent>
                                <CardContent>
                                    3-5 ngày · <span className="font-semibold">50.000 đ</span>
                                </CardContent>
                            </Card>
                            <Card className="gap-4">
                                <CardContent className="flex flex-row gap-3">
                                    <RadioGroupItem value="same_day" id="same_day" />
                                    <CardTitle>Hỏa tốc 🚀</CardTitle>
                                </CardContent>
                                <CardContent>
                                    1-2h · <span className="font-semibold">80.000 đ</span>
                                </CardContent>
                            </Card>
                        </RadioGroup>
                    </div>

                    <h1 className="font-semibold mt-2 w-full">Phương thức thanh toán</h1>
                    <RadioGroup value={paymentMethodSelected} onValueChange={setPaymentMethodSelected}>
                        <div className="grid gap-2">
                            <Card className="gap-4">
                                <CardContent className="flex flex-row gap-3 items-center justify-start">
                                    <RadioGroupItem value="momo" id="momo" />
                                    <Image src="https://developers.momo.vn/v3/img/logo.svg" width={35} height={35} alt="momo" />
                                    <Label htmlFor="momo">Ví Mo Mo</Label>
                                </CardContent>
                            </Card>
                            <Card className="gap-4">
                                <CardContent className="flex flex-row gap-3 items-center justify-start">
                                    <RadioGroupItem value="cod" id="cod" />
                                    <GiMoneyStack size={35} />
                                    <Label htmlFor="cod">Thanh toán khi nhận hàng</Label>
                                </CardContent>
                            </Card>
                        </div>
                    </RadioGroup>
                </div>
                <Card className='w-full md:w-[30%]'>
                    <CardHeader>
                        <h1 className='font-semibold text-2xl'>
                            Thông tin đơn hàng đã chọn
                        </h1>

                        {Object.entries(groupedProducts).map(
                            ([shopId, items]) => {

                                const shopTotal =
                                    items?.reduce(
                                        (acc, item) =>
                                            acc +
                                            Number(item.price) * item.quantity,
                                        0
                                    ) ?? 0;

                                return (
                                    <Card
                                        key={shopId}
                                        className="mb-4"
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                {items?.[0]?.shopName || `Shop #${shopId}`}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-3">

                                            {items?.map(item => (
                                                <Card
                                                    key={`${item.productId}-${item.variantId ?? 'base'}`}
                                                    className="px-3 py-2"
                                                >
                                                    <div className="flex gap-3">

                                                        <Image
                                                            src={item.productImage || "/image-not-found.jpg"}
                                                            className="size-18 object-cover rounded-md"
                                                            alt="product image"
                                                            width={100}
                                                            height={100}
                                                        />

                                                        <div className="flex flex-col gap-1 justify-center">

                                                            <p className="font-medium text-sm">
                                                                {item.productName}
                                                            </p>

                                                            {item.variantName && (
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-medium">
                                                                        {item.variantName}
                                                                    </span>
                                                                </p>
                                                            )}

                                                            <p className="text-xs text-muted-foreground">
                                                                SL: {item.quantity}
                                                            </p>

                                                            <p className="font-semibold text-orange-500 text-sm">
                                                                {(Number(item.price) * item.quantity)
                                                                    .toLocaleString("vi-VN")} đ
                                                            </p>

                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}

                                            {/* Voucher shop */}

                                            <div className="border rounded-lg p-3">

                                                <h1 className="font-medium mb-2">
                                                    Voucher shop
                                                </h1>

                                                <div className="flex gap-2">

                                                    <Input
                                                        placeholder="Nhập mã voucher"
                                                        value={
                                                            shopVoucherCodes[
                                                            Number(shopId)
                                                            ] || ""
                                                        }
                                                        onChange={(e) => {

                                                            setShopVoucherCodes(prev => ({
                                                                ...prev,
                                                                [Number(shopId)]:
                                                                    e.target.value
                                                            }));

                                                            setShopDiscounts(prev => ({
                                                                ...prev,
                                                                [Number(shopId)]: 0
                                                            }));

                                                        }}
                                                    />

                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            onApplyShopVoucher(
                                                                Number(shopId),
                                                                shopTotal
                                                            )
                                                        }
                                                    >
                                                        Áp dụng
                                                    </Button>

                                                </div>

                                                {shopDiscounts[
                                                    Number(shopId)
                                                ] > 0 && (
                                                        <div className="mt-2 text-sm">

                                                            Giảm:
                                                            {" "}
                                                            {
                                                                shopDiscounts[
                                                                    Number(shopId)
                                                                ].toLocaleString("vi-VN")
                                                            }
                                                            đ

                                                        </div>
                                                    )}

                                            </div>

                                            <div className="border-t pt-3">

                                                <div className="flex justify-between font-medium">

                                                    <span>
                                                        Tạm tính shop
                                                    </span>

                                                    <span>
                                                        {shopTotal.toLocaleString("vi-VN")} đ
                                                    </span>

                                                </div>

                                                <div className="flex justify-between text-sm">

                                                    <span>
                                                        Giảm giá shop
                                                    </span>

                                                    <span>
                                                        -
                                                        {(
                                                            shopDiscounts[
                                                            Number(shopId)
                                                            ] || 0
                                                        ).toLocaleString("vi-VN")}
                                                        đ
                                                    </span>

                                                </div>

                                            </div>

                                        </CardContent>
                                    </Card>
                                );
                            }
                        )}
                    </CardHeader>
                    <CardContent>

                        {/* Subtotal */}
                        <div className='flex justify-between'>
                            <h1>Tạm tính</h1>
                            <h1>{subTotal.toLocaleString("vi-VN")} đ</h1>

                        </div>
                        <div className='flex justify-between'>
                            <h1>Phí vận chuyển</h1>
                            <h1 className="font-medium">{shippingFee.toLocaleString('vi-VN')} đ</h1>
                        </div>

                        <div className='flex justify-between'>
                            <h1>
                                Voucher shop
                            </h1>

                            <h1>
                                -{totalShopDiscount.toLocaleString("vi-VN")} đ
                            </h1>
                        </div>

                        <div className='flex justify-between'>
                            <h1 className='font-bold text-2xl'>Tổng cộng</h1>
                            <h1 className='font-bold text-2xl'>{orderTotal.toLocaleString("vi-VN")} đ</h1>
                        </div>

                    </CardContent>
                    <CardFooter className='flex flex-col gap-1'>
                        <Button className='w-full' onClick={onCheckoutBtnClick}><CreditCard />Thanh toán</Button>
                        <Button variant="outline" className='w-full' onClick={() => router.back()}>Quay lại</Button>
                    </CardFooter>
                </Card>
            </div>

        </div >
    )
}

export default CheckOutPage
