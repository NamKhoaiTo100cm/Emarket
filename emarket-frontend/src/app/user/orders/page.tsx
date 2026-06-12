"use client"
import BadgeOrderStatus from "@/components/ui/bagge-order-status";
import { Button } from "@/components/ui/button";
import { orderService } from "@/services/order.service";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle, Store, Truck, AlertCircle, Plus, X, PackageCheck } from "lucide-react";
import { PaginationLayout } from "@/components/layout/PaginationLayout";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/useCartStore";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UserOrdersPage() {
    const [orderList, setOrderList] = useState<any[]>([]);
    const router = useRouter();
    const addToCart = useCartStore(state => state.addToCart);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
    });

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [returnReason, setReturnReason] = useState<string>("");
    const [bankName, setBankName] = useState<string>("");
    const [bankAccount, setBankAccount] = useState<string>("");
    const [bankOwner, setBankOwner] = useState<string>("");
    const [proofImages, setProofImages] = useState<File[]>([]);
    const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
    const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);
    const [isConfirmingDelivery, setIsConfirmingDelivery] = useState<number | null>(null);

    const fetchOrders = async () => {
        const res = await orderService.findByUserId(pagination.page, pagination.pageSize);
        if (res.statusCode == 200) {
            setOrderList(res.data);
            setPagination(prev => ({
                ...prev,
                totalItems: res.pagination.totalCount,
                totalPages: Math.ceil(res.pagination.totalCount / prev.pageSize),
            }));
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [pagination.page]);

    const handleConfirmDelivery = async (orderId: number) => {
        setIsConfirmingDelivery(orderId);
        try {
            const res = await orderService.userConfirmDelivery(orderId);
            toast.success("Xác nhận nhận hàng thành công!");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || "Không thể xác nhận nhận hàng");
        } finally {
            setIsConfirmingDelivery(null);
        }
    };

    const handleRequestReturn = async () => {
        if (!selectedOrderId || !returnReason.trim()) {
            toast.error("Vui lòng nhập lý do trả hàng");
            return;
        }
        setIsSubmittingReturn(true);
        try {
            const formData = new FormData();
            formData.append("reason", returnReason.trim());
            if (bankName.trim()) formData.append("bankName", bankName.trim());
            if (bankAccount.trim()) formData.append("bankAccount", bankAccount.trim());
            if (bankOwner.trim()) formData.append("bankOwner", bankOwner.trim());

            proofImages.forEach((file) => {
                formData.append("proofImages", file);
            });

            await orderService.createReturnRequest(selectedOrderId, formData);
            toast.success("Gửi yêu cầu trả hàng thành công");
            setOpenReturnDialog(false);
            setReturnReason("");
            setBankName("");
            setBankAccount("");
            setBankOwner("");
            setProofImages([]);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || "Không thể gửi yêu cầu trả hàng");
        } finally {
            setIsSubmittingReturn(false);
        }
    };

    const getReturnStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200">Yêu cầu trả hàng: Chờ duyệt</span>;
            case "APPROVED":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200">Đã đồng ý trả hàng</span>;
            case "REJECTED":
                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200">Từ chối trả hàng</span>;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 w-full ">
            <h1 className="text-xl font-semibold mb-4">Quản lý đơn hàng</h1>

            <div className="flex flex-col gap-3">
                {orderList.map((order) => (
                    <div key={order.id} className="bg-background border border-border rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Store size={16} className="text-muted-foreground" />
                                <span>{order.shop.name ?? "Shop"}</span>
                                <Button variant="outline" size="sm" className="h-6 text-xs px-2">Chat</Button>
                                <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => {
                                    router.push(`/shop-detail/${order.shop.id}`)
                                }}>Xem shop</Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <BadgeOrderStatus status={order.status} />
                            </div>
                        </div>

                        {/* Items */}
                        <div className="px-4 py-3 border-b border-border flex flex-col gap-3">
                            {order.items.slice(0, 2).map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <Image
                                        src={item.productImage || item.image || "/iphone-17-pro-max.webp"}
                                        alt={item.productName}
                                        width={56}
                                        height={56}
                                        className="rounded-md border border-border object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {item.variantName && `Phân loại: ${item.variantName}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        {Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                                    </span>
                                </div>
                            ))}
                            {order.items.length > 2 && (
                                <p className="text-xs text-muted-foreground">+{order.items.length - 2} sản phẩm khác</p>
                            )}
                        </div>

                        {/* Banner đang giao hàng */}
                        {order.status === "shipping" && (
                            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-800 flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                                <Truck size={14} className="flex-shrink-0 animate-pulse" />
                                <span>Hàng đang trên đường giao — đơn hàng sẽ tự động hoàn tất nếu bạn không xác nhận</span>
                            </div>
                        )}

                        {order.returnRequest && (

                            <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex flex-col gap-1 text-xs">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <span className="text-muted-foreground">Thông tin hoàn tiền:</span>
                                    <span className={order.returnRequest.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : order.returnRequest.status === "REJECTED" ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>
                                        {order.returnRequest.status === "APPROVED"
                                            ? `Đã hoàn tiền thành công qua ${order.paymentMethod === "cod" ? "Tiền mặt / Chuyển khoản" : order.paymentMethod.toUpperCase()}`
                                            : order.returnRequest.status === "PENDING"
                                                ? "Đang chờ duyệt hoàn tiền"
                                                : "Yêu cầu trả hàng bị từ chối"}
                                    </span>
                                </div>
                                {order.returnRequest.staffNote && (
                                    <div className="text-muted-foreground italic mt-0.5 border-l-2 border-border pl-2 py-0.5">
                                        Phản hồi từ hệ thống: "{order.returnRequest.staffNote}"
                                    </div>
                                )}
                                {order.returnRequest.images && order.returnRequest.images.length > 0 && (
                                    <div className="flex gap-2 mt-1.5 flex-wrap">
                                        <span className="text-muted-foreground block w-full text-[10px] uppercase font-semibold">Ảnh minh chứng đã gửi:</span>
                                        {order.returnRequest.images.map((imgUrl: string, idx: number) => (
                                            <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="relative w-12 h-12 rounded-md border border-border overflow-hidden block hover:opacity-80 transition-opacity">
                                                <Image src={imgUrl} alt="proof" width={100} height={100} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2.5 flex-wrap gap-2">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                                    <span className="w-px h-3 bg-border" />
                                    <span>Mã đơn: #{order.id}</span>
                                    <span className="w-px h-3 bg-border" />
                                    <span>Vận chuyển: {order.shippingMethod.toUpperCase()}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-sm text-muted-foreground">Thành tiền:</span>
                                    <span className="text-base font-semibold text-orange-600">
                                        {Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.total)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {order.returnRequest && (
                                    <div className="mr-2">
                                        {getReturnStatusBadge(order.returnRequest.status)}
                                    </div>
                                )}

                                {/* Nút Xác nhận nhận hàng (shipping) */}
                                {order.status === "shipping" && (
                                    <Button
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700 text-white border-0 gap-1"
                                        disabled={isConfirmingDelivery === order.id}
                                        onClick={() => handleConfirmDelivery(order.id)}
                                    >
                                        <PackageCheck className="w-4 h-4" />
                                        {isConfirmingDelivery === order.id ? "Đang xử lý..." : "Đã nhận hàng"}
                                    </Button>
                                )}

                                {order.status === "delivered" && !order.isSettled && !order.returnRequest && (!order.settlementAt || new Date(order.settlementAt) > new Date()) && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedOrderId(order.id);
                                            setReturnReason("");
                                            setBankName("");
                                            setBankAccount("");
                                            setBankOwner("");
                                            setProofImages([]);
                                            setOpenReturnDialog(true);
                                        }}
                                    >
                                        Trả hàng / Hoàn tiền
                                    </Button>
                                )}

                                <Button variant="outline" size="sm">Chi tiết</Button>
                                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0" onClick={() => {
                                    order.items.forEach((item: any) => {
                                        addToCart(item.productId)
                                    })
                                    router.push(`/cart`)
                                }}>Mua lại</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-muted-foreground">
                    Hiển thị 1 - {orderList.length} trong {pagination.totalItems} đơn hàng
                </span>
                <PaginationLayout
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
            </div>

            {/* Return Dialog */}
            <Dialog open={openReturnDialog} onOpenChange={setOpenReturnDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            Yêu cầu trả hàng / hoàn tiền
                        </DialogTitle>
                        <DialogDescription>
                            Vui lòng cho biết lý do bạn muốn trả hàng hoặc hoàn tiền cho đơn hàng #{selectedOrderId}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-sm font-semibold">Lý do cụ thể</Label>
                            <Input
                                id="reason"
                                placeholder="Ví dụ: Sản phẩm lỗi, không đúng mô tả, giao thiếu hàng..."
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2 mt-2">
                            <Label className="text-sm font-semibold">Ảnh minh chứng (tối đa 5 ảnh)</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {proofImages.map((file, idx) => (
                                    <div key={idx} className="relative w-16 h-16 rounded-lg border border-border overflow-hidden group">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt="proof"
                                            className="w-full h-full object-cover"
                                            width={64}
                                            height={64}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => setProofImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                {proofImages.length < 5 && (
                                    <Label className="flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer bg-muted/40 hover:bg-muted/70 transition-colors">
                                        <Plus className="w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                setProofImages(prev => {
                                                    const combined = [...prev, ...files];
                                                    return combined.slice(0, 5); // max 5
                                                });
                                            }}
                                        />
                                    </Label>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-border pt-3 mt-2 space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thông tin nhận tiền hoàn chuyển khoản</h4>
                            <div className="grid gap-1.5">
                                <Label htmlFor="bankName" className="text-xs font-medium">Tên ngân hàng</Label>
                                <Input
                                    id="bankName"
                                    placeholder="Ví dụ: Vietcombank, Techcombank, MB..."
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="bankAccount" className="text-xs font-medium">Số tài khoản</Label>
                                <Input
                                    id="bankAccount"
                                    placeholder="Nhập số tài khoản ngân hàng..."
                                    value={bankAccount}
                                    onChange={(e) => setBankAccount(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="bankOwner" className="text-xs font-medium">Tên chủ tài khoản</Label>
                                <Input
                                    id="bankOwner"
                                    placeholder="Nhập tên viết hoa không dấu..."
                                    value={bankOwner}
                                    onChange={(e) => setBankOwner(e.target.value)}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Hủy</Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={handleRequestReturn}
                            disabled={isSubmittingReturn}
                        >
                            {isSubmittingReturn ? "Đang gửi..." : "Gửi yêu cầu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}