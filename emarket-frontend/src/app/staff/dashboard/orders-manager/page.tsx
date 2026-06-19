"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    ShoppingCart,
    Search,
    Eye,
    User,
    Store,
    Calendar,
    DollarSign,
    ClipboardList,
    Loader2,
    ShieldAlert,
    Phone,
    MapPin,
    CreditCard,
    Info,
    CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";
import BadgeOrderStatus from "@/components/ui/bagge-order-status";
import Image from "next/image";
import { PaginationLayout } from "@/components/layout/PaginationLayout";

export default function StaffOrdersManagerPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 8,
        totalItems: 0,
        totalPages: 1,
    });

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getAdminOrders(
                pagination.page,
                pagination.pageSize,
                debouncedSearchQuery,
                statusFilter
            );
            if (res && res.statusCode === 200) {
                setOrders(res.data || []);
                setPagination(prev => ({
                    ...prev,
                    totalItems: res.pagination.totalCount,
                    totalPages: Math.ceil(res.pagination.totalCount / prev.pageSize) || 1
                }));
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, statusFilter, debouncedSearchQuery]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    };

    return (
        <div className="space-y-6 p-1">
            {/* Header section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        Quản lý đơn hàng hệ thống
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Theo dõi, tra cứu và kiểm tra thông tin các đơn hàng đang giao dịch trên toàn bộ hệ thống Emarket.
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Tổng số đơn hàng</span>
                        <ClipboardList className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{pagination.totalItems}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tìm thấy theo tiêu chí tìm kiếm hiện tại</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Bộ lọc trạng thái</span>
                        <Info className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-amber-600 capitalize">
                        {statusFilter === "all" ? "Tất cả trạng thái" : statusFilter}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Chỉ hiển thị đơn hàng thuộc trạng thái này</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Từ khóa tìm kiếm</span>
                        <Search className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 truncate max-w-full">
                        {debouncedSearchQuery ? `"${debouncedSearchQuery}"` : "Không có"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Tìm theo mã đơn, khách hàng, cửa hàng...</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-muted/30 p-4 rounded-xl border border-border">
                {/* Tabs Filter */}
                <div className="flex flex-wrap gap-1">
                    {[
                        { label: "Tất cả", value: "all" },
                        { label: "Chờ xử lý", value: "pending" },
                        { label: "Đã xác nhận", value: "confirmed" },
                        { label: "Đang giao", value: "shipping" },
                        { label: "Đã giao", value: "delivered" },
                        { label: "Đã hủy", value: "cancelled" },
                        { label: "Hoàn hàng", value: "returned" },
                    ].map((tab) => (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? "default" : "ghost"}
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => {
                                setStatusFilter(tab.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Mã đơn, khách hàng, shop, sđt..."
                        className="pl-9 h-9 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Đang tải danh sách đơn hàng...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ClipboardList className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                        <h3 className="font-semibold text-lg">Không tìm thấy đơn hàng nào</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                            Không có đơn hàng nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm của bạn.
                        </p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-16">ID</TableHead>
                                    <TableHead>Khách hàng</TableHead>
                                    <TableHead>Cửa hàng</TableHead>
                                    <TableHead className="min-w-[200px]">Sản phẩm</TableHead>
                                    <TableHead>Tổng tiền</TableHead>
                                    <TableHead>Thanh toán</TableHead>
                                    <TableHead>Trạng thái đơn</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-semibold text-xs">#{order.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{order.receiverName || "N/A"}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{order.receiverPhone || "N/A"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{order.shop?.name || "N/A"}</span>
                                                <span className="text-[10px] text-muted-foreground">ID: #{order.shopId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {order.items?.slice(0, 2).map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-2">
                                                        <Image
                                                            src={item.productImage || "/image-not-found.jpg"}
                                                            alt={item.productName || "Product image"}
                                                            width={30}
                                                            height={30}
                                                            className="rounded object-cover border shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-xs truncate max-w-[150px] font-medium" title={item.productName}>
                                                                {item.productName}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {item.variantName ? `${item.variantName} | ` : ""}x{item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items?.length > 2 && (
                                                    <p className="text-[10px] text-muted-foreground font-medium pl-1">
                                                        +{order.items.length - 2} sản phẩm khác
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-sm">
                                            {formatCurrency(order.total)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs uppercase font-semibold text-muted-foreground">
                                                    {order.paymentMethod}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium w-fit ${
                                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                                                    order.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                                                }`}>
                                                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                                     order.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                                                     order.paymentStatus === 'processing' ? 'Đang xử lý' : 'Chưa thanh toán'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <BadgeOrderStatus
                                                status={order.status}
                                                paymentMethod={order.paymentMethod}
                                                paymentStatus={order.paymentStatus}
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                                                <span>{new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                title="Xem chi tiết đơn hàng"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setOpenDetailDialog(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination footer */}
                        <div className="border-t border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                Hiển thị {orders.length} trong số {pagination.totalItems} đơn hàng
                            </span>
                            <PaginationLayout
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Detailed Order Dialog */}
            <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
                <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-3xl overflow-y-auto max-h-[90vh] p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-lg font-bold border-b pb-2 gap-2 text-left">
                            <span>Chi tiết đơn hàng #{selectedOrder?.id}</span>
                            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                                Ngày đặt: {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : ""}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Customer & Shop Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Buyer Info */}
                                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 border-b border-border pb-1.5 text-primary">
                                        <User className="h-4 w-4" />
                                        Thông tin người mua hàng
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tên người nhận:</span>
                                            <span className="font-medium">{selectedOrder.receiverName || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Số điện thoại:</span>
                                            <span className="font-medium font-mono">{selectedOrder.receiverPhone || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between flex-wrap gap-1">
                                            <span className="text-muted-foreground">Tài khoản (Email):</span>
                                            <span className="font-medium font-mono">{selectedOrder.user?.email || "N/A"}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground">Địa chỉ giao hàng:</span>
                                            <span className="font-medium bg-muted/30 p-1.5 rounded">{selectedOrder.shippingAddress || "N/A"}</span>
                                        </div>
                                        {selectedOrder.note && (
                                            <div className="flex flex-col gap-1 mt-1 text-muted-foreground italic">
                                                <span className="font-medium text-foreground not-italic">Ghi chú của khách:</span>
                                                <span>"{selectedOrder.note}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Shop Info */}
                                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 border-b border-border pb-1.5 text-primary">
                                        <Store className="h-4 w-4" />
                                        Thông tin cửa hàng bán lẻ
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tên cửa hàng:</span>
                                            <span className="font-medium">{selectedOrder.shop?.name || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mã cửa hàng:</span>
                                            <span className="font-mono font-medium">#{selectedOrder.shopId}</span>
                                        </div>
                                        {selectedOrder.shop?.phone && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Số điện thoại shop:</span>
                                                <span className="font-mono font-medium">{selectedOrder.shop.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment & Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                                <div className="space-y-1.5 text-xs">
                                    <h5 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Thanh toán</h5>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phương thức:</span>
                                        <span className="font-mono font-bold uppercase">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Trạng thái:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                                            selectedOrder.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                                        }`}>
                                            {selectedOrder.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                             selectedOrder.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                                             selectedOrder.paymentStatus === 'processing' ? 'Đang xử lý' : 'Chưa thanh toán'}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <h5 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Giao vận & Đơn hàng</h5>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phương thức giao hàng:</span>
                                        <span className="font-medium uppercase">{selectedOrder.shippingMethod}</span>
                                    </div>
                                    {selectedOrder.trackingCode && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mã vận đơn:</span>
                                            <span className="font-mono font-semibold">#{selectedOrder.trackingCode}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Trạng thái đơn hàng:</span>
                                        <BadgeOrderStatus
                                            status={selectedOrder.status}
                                            paymentMethod={selectedOrder.paymentMethod}
                                            paymentStatus={selectedOrder.paymentStatus}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Return Request Details if returned */}
                            {selectedOrder.status === 'returned' && selectedOrder.returnRequest && (
                                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20 dark:bg-rose-950/5 dark:border-rose-900/50 space-y-2">
                                    <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                                        <ShieldAlert className="h-4 w-4" />
                                        Thông tin trả hàng / hoàn tiền
                                    </h4>
                                    <div className="text-xs space-y-1.5">
                                        <p><span className="text-muted-foreground">Lý do:</span> "{selectedOrder.returnRequest.reason}"</p>
                                        {selectedOrder.returnRequest.staffNote && (
                                            <p className="bg-background border p-2 rounded italic mt-1 text-foreground/80">
                                                <span className="font-semibold not-italic block text-[10px] text-muted-foreground uppercase mb-0.5">Phản hồi của nhân viên:</span>
                                                "{selectedOrder.returnRequest.staffNote}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Products Grid */}
                            <div>
                                <h3 className="font-semibold text-sm mb-3">Sản phẩm trong đơn hàng</h3>
                                <div className="border rounded-lg overflow-x-auto w-full">
                                    <Table className="min-w-[600px] w-full">
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Sản phẩm</TableHead>
                                                <TableHead className="text-center w-[100px]">Số lượng</TableHead>
                                                <TableHead className="text-right w-[120px]">Đơn giá</TableHead>
                                                <TableHead className="text-right w-[150px]">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.items?.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="flex items-center gap-3">
                                                        <Image
                                                            src={item.productImage || "/image-not-found.jpg"}
                                                            alt={item.productName || "Product image"}
                                                            width={45}
                                                            height={45}
                                                            className="rounded object-cover border shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm truncate max-w-[250px]" title={item.productName}>
                                                                {item.productName}
                                                            </p>
                                                            {item.variantName && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">Phân loại: {item.variantName}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                                                    <TableCell className="text-right text-sm">
                                                        {Number(item.price).toLocaleString("vi-VN")} đ
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-sm">
                                                        {(Number(item.price) * item.quantity).toLocaleString("vi-VN")} đ
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Totals Breakdown */}
                            <div className="flex justify-end">
                                <div className="w-full sm:w-80 space-y-2 text-sm border p-4 rounded-lg bg-muted/10">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tạm tính:</span>
                                        <span>{Number(selectedOrder.subtotal).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phí vận chuyển:</span>
                                        <span>+{Number(selectedOrder.shippingFee).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    {Number(selectedOrder.discount) > 0 && (
                                        <div className="flex justify-between text-destructive">
                                            <span>Giảm giá (Voucher):</span>
                                            <span>-{Number(selectedOrder.discount).toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 font-semibold text-base text-primary">
                                        <span>Tổng cộng:</span>
                                        <span>{Number(selectedOrder.total).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="border-t pt-4">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm">Đóng</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
