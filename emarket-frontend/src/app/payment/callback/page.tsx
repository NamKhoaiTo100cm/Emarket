"use client"
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GiConfirmed } from "react-icons/gi";
import { XCircle } from "lucide-react";

const PaymentCallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const resultCode = searchParams.get("resultCode");
    const momoOrderId = searchParams.get("orderId"); // ORDER-1_2_3-timestamp
    const success = resultCode === "0";

    // parse orderIds từ momoOrderId
    const orderIds = momoOrderId?.split("-")[1]?.split("_").map(Number) ?? [];

    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!success || orderIds.length === 0) {
            setLoading(false);
            return;
        }

        Promise.all(orderIds.map(id => orderService.getOrderById(id)))
            .then(results => setOrders(results.map(r => r.data)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Đang xử lý kết quả...</p>
        </div>
    );

    if (!success) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <XCircle className="size-16 text-red-500" />
            <h1 className="text-2xl font-semibold">Thanh toán thất bại hoặc bị huỷ</h1>
            <Button onClick={() => router.replace("/checkout")}>Thử lại</Button>
        </div>
    );

    return (
        <div className="p-4 mt-13.75 min-h-screen">
            <div className="flex flex-col items-center gap-2 mb-6">
                <GiConfirmed className="size-14 text-green-500" />
                <h1 className="text-2xl font-semibold">Đặt hàng thành công</h1>
            </div>

            <div className="max-w-2xl mx-auto flex flex-col gap-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="font-semibold">
                            Đơn hàng #{order.id}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">Thông tin giao hàng</p>
                                    <p>Người nhận: {order.receiverName}</p>
                                    <p>SĐT: {order.receiverPhone}</p>
                                    <p>Địa chỉ: {order.shippingAddress}</p>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold">Thông tin đơn hàng</p>
                                    <p>Mã đơn: #{order.id}</p>
                                    <p>Tổng tiền: {Number(order.total).toLocaleString("vi-VN")}đ</p>
                                    <p>Thanh toán: MoMo</p>
                                    <p>Trạng thái: {order.paymentStatus}</p>
                                </div>
                            </div>

                            <div className="border-t pt-3 space-y-2">
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.productName} x{item.quantity}</span>
                                        <span>{Number(item.price).toLocaleString("vi-VN")}đ</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="flex gap-2 justify-center">
                    <Button onClick={() => router.push("/user/orders")}>Xem đơn hàng</Button>
                    <Button variant="outline" onClick={() => router.push("/")}>Về trang chủ</Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCallbackPage;