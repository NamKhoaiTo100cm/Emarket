"use client"
import { useMe } from "@/components/hooks/useAuth";
import { useMyShop } from "@/components/hooks/useShop";
import { PaginationLayout } from "@/components/layout/PaginationLayout";
import ShippingLabel from "@/components/layout/ShippingLabel";
import BadgeOrderStatus from "@/components/ui/bagge-order-status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orderService } from "@/services/order.service";
import { Check, Delete, Eye, Printer, Truck } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { toast } from "sonner";

const OrdersManagerPage = () => {
    const [printOrder, setPrintOrder] = useState<any>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedDetailOrder, setSelectedDetailOrder] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const { data: resUser } = useMe();
    const { data: resShop } = useMyShop(resUser?.data?.id, !!resUser?.data?.id);
    const myShop = resShop?.data;
    const [orderList, setOrderList] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
    })

    const labelRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: labelRef,
        documentTitle: `Phiếu giao hàng - ${printOrder?.orderCode}`,
        onAfterPrint: () => setPreviewOpen(false),
    });

    const openPrint = (order: any) => {
        setPrintOrder(order);
        setPreviewOpen(true);
    };

    const updateOrderStatus = async (orderId: number, status: 'confirmed' | 'cancelled' | 'shipping') => {
        const res = await orderService.sellerUpdateOrderStatus(orderId, status);
        if (res.statusCode == 200) {
            toast.success(`Cập nhật trạng thái đơn hàng #${orderId} thành công`);
            fetchOrders();
        }
    }

    const fetchOrders = async () => {
        const res = await orderService.findByShopId(myShop.id, pagination.page, pagination.pageSize);
        if (res.statusCode == 200) {
            setOrderList(res.data);
            setPagination({
                ...pagination,
                totalItems: res.pagination.totalCount,
                totalPages: Number(Math.ceil(res.pagination.totalCount / pagination.pageSize))
            })
        }
    }
    useEffect(() => {
        if (myShop?.id) {
            fetchOrders();
        }
    }, [myShop?.id, pagination.page])

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Orders Manager</h1>

            <Table className="bg-primary-foreground rounded-lg overflow-hidden">
                <TableHeader>
                    <TableRow>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Vận chuyển</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orderList.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>
                                <p className="font-medium">{order.receiverName}</p>
                                <p className="text-xs text-muted-foreground">{order.receiverPhone}</p>
                            </TableCell>
                            <TableCell className="min-w-[180px]">
                                {order.items.slice(0, 2).map((product: any) => (
                                    <div key={product.id} className="flex items-center gap-2 mb-2">
                                        <Image
                                            src={product.productImage || "/iphone-17-pro-max.webp"}
                                            alt=""
                                            className="rounded"
                                            width={40}
                                            height={40}
                                        />
                                        <div>
                                            <p className="text-sm">{product.productName}</p>
                                            {product.variantName && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Phân loại: {product.variantName}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">x{product.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                                {order.items.length > 2 && (
                                    <p className="text-xs text-muted-foreground">
                                        +{order.items.length - 2} sản phẩm
                                    </p>
                                )}
                            </TableCell>
                            <TableCell>
                                {Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(order.total)}
                            </TableCell>
                            <TableCell><BadgeOrderStatus status={order?.status || 'pending'} paymentMethod={order?.paymentMethod} paymentStatus={order?.paymentStatus} /></TableCell>
                            <TableCell>
                                <div>
                                    <span>{order.shippingMethod.toUpperCase()}</span>
                                    {order.trackingCode && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            #{order.trackingCode}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>{order.createdAt}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    {order.status === 'pending' && (<>
                                        <Button size="icon" variant="default" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                                            <Check />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                                            <Delete />
                                        </Button>
                                    </>
                                    )}

                                    <Button 
                                        size="icon" 
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedDetailOrder(order);
                                            setDetailOpen(true);
                                        }}
                                        title="Xem chi tiết"
                                    >
                                        <Eye />
                                    </Button>
                                    {/* Nút in phiếu + Giao hàng */}
                                    {order.status === 'confirmed' && (<>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => openPrint(order)}
                                            title="In phiếu giao hàng"
                                        >
                                            <Printer />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="default"
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                            onClick={() => updateOrderStatus(order.id, 'shipping')}
                                            title="Giao hàng"
                                        >
                                            <Truck />
                                        </Button>
                                    </>)}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={8} className="bg-primary-foreground">
                            <div className="flex justify-between items-center w-full">
                                <span className="text-muted-foreground">
                                    Hiển thị 1 - {orderList.length} trong {pagination.totalItems} đơn hàng
                                </span>
                                <div className="flex gap-2">
                                    <PaginationLayout currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => {
                                        setPagination({
                                            ...pagination,
                                            page
                                        })
                                    }} />
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>

            {/* Dialog xem trước phiếu trước khi in */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="w-fit max-w-none! max-h-none! p-2">
                    <DialogHeader>
                        <DialogTitle>Xem trước phiếu giao hàng</DialogTitle>
                    </DialogHeader>
                    <div>
                        {printOrder && (
                            <ShippingLabel
                                ref={labelRef}
                                senderAddress={myShop?.address}
                                senderName={myShop?.name}
                                senderPhone={myShop?.phone}
                                orderCode={printOrder.id.toString()}
                                trackingCode={printOrder.trackingCode}
                                customer={{
                                    id: printOrder.userId,
                                    email: "",
                                    name: printOrder.receiverName,
                                    phone: printOrder.receiverPhone,
                                    address: printOrder.shippingAddress
                                }}
                                products={printOrder.items.map((item: any) => ({
                                    id: item.id,
                                    name: item.productName + (item.variantName ? ` (${item.variantName})` : ''),
                                    quantity: item.quantity,
                                    price: item.price,
                                }))}
                                codAmount={printOrder.total}
                                paymentMethod={printOrder.paymentMethod}
                                deliveryMethod={printOrder.shippingMethod}
                                createdAt={new Date(printOrder.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                            Đóng
                        </Button>
                        <Button onClick={() => handlePrint()}>
                            <Printer className="w-4 h-4 mr-2" />
                            In phiếu
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog xem chi tiết đơn hàng */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-3xl overflow-y-auto max-h-[90vh] p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-lg font-bold border-b pb-2 gap-2 text-left">
                            <span>Chi tiết đơn hàng #{selectedDetailOrder?.id}</span>
                            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                                Ngày đặt: {selectedDetailOrder?.createdAt ? new Date(selectedDetailOrder.createdAt).toLocaleString("vi-VN") : ""}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    {selectedDetailOrder && (
                        <div className="space-y-6">
                            {/* Thông tin khách hàng & Giao hàng */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                                <div>
                                    <h3 className="font-semibold text-sm mb-2 text-primary">Thông tin nhận hàng</h3>
                                    <p className="text-sm"><span className="font-medium">Người nhận:</span> {selectedDetailOrder.receiverName}</p>
                                    <p className="text-sm"><span className="font-medium">Điện thoại:</span> {selectedDetailOrder.receiverPhone}</p>
                                    <p className="text-sm"><span className="font-medium">Địa chỉ:</span> {selectedDetailOrder.shippingAddress}</p>
                                    {selectedDetailOrder.note && (
                                        <p className="text-sm mt-1 text-muted-foreground italic"><span className="font-medium text-foreground not-italic">Ghi chú của khách:</span> "{selectedDetailOrder.note}"</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm mb-2 text-primary">Thông tin vận chuyển & Thanh toán</h3>
                                    <p className="text-sm"><span className="font-medium">Vận chuyển:</span> {selectedDetailOrder.shippingMethod?.toUpperCase()}</p>
                                    {selectedDetailOrder.trackingCode && (
                                        <p className="text-sm"><span className="font-medium">Mã vận đơn:</span> #{selectedDetailOrder.trackingCode}</p>
                                    )}
                                    <p className="text-sm"><span className="font-medium">Thanh toán:</span> {selectedDetailOrder.paymentMethod?.toUpperCase()}</p>
                                    <div className="text-sm flex gap-1 items-center mt-1">
                                        <span className="font-medium">Trạng thái thanh toán:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            selectedDetailOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                                            selectedDetailOrder.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                                        }`}>
                                            {selectedDetailOrder.paymentStatus === 'paid' ? 'Đã thanh toán' :
                                             selectedDetailOrder.paymentStatus === 'refunded' ? 'Đã hoàn tiền' :
                                             selectedDetailOrder.paymentStatus === 'processing' ? 'Đang xử lý' : 'Chưa thanh toán'}
                                        </span>
                                    </div>
                                    <div className="text-sm flex gap-1.5 items-center mt-1">
                                        <span className="font-medium">Trạng thái đơn hàng:</span>
                                        <BadgeOrderStatus 
                                            status={selectedDetailOrder.status} 
                                            paymentMethod={selectedDetailOrder.paymentMethod} 
                                            paymentStatus={selectedDetailOrder.paymentStatus} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách sản phẩm */}
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
                                            {selectedDetailOrder.items.map((item: any) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="flex items-center gap-3">
                                                        <Image
                                                            src={item.productImage || "/iphone-17-pro-max.webp"}
                                                            alt=""
                                                            width={45}
                                                            height={45}
                                                            className="rounded object-cover border shrink-0"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm truncate max-w-[250px]" title={item.productName}>{item.productName}</p>
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

                            {/* Chi tiết thanh toán */}
                            <div className="flex justify-end">
                                <div className="w-full sm:w-80 space-y-2 text-sm border p-4 rounded-lg bg-muted/10">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tạm tính:</span>
                                        <span>{Number(selectedDetailOrder.subtotal).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phí vận chuyển:</span>
                                        <span>+{Number(selectedDetailOrder.shippingFee).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                    {Number(selectedDetailOrder.discount) > 0 && (
                                        <div className="flex justify-between text-destructive">
                                            <span>Giảm giá (Voucher):</span>
                                            <span>-{Number(selectedDetailOrder.discount).toLocaleString("vi-VN")} đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-2 font-semibold text-base text-primary">
                                        <span>Tổng cộng:</span>
                                        <span>{Number(selectedDetailOrder.total).toLocaleString("vi-VN")} đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>
                            Đóng
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrdersManagerPage;

