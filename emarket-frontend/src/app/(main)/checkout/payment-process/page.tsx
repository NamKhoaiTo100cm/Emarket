"use client"
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { apiFetch } from "@/lib/api";
import { orderService } from "@/services/order.service";
import { paymentService } from "@/services/payment.service";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect } from "react";
import { toast } from "sonner";

type ItemProps = {
    productId: number,
    productName: string,
    quantity: number,
    price: string,
}
type PaymentConfirmedProps = {
    userId: number,
    shopId: number,
    shippingAddress: string,
    receiverName: string,
    receiverPhone: string,
    paymentMethod: string,
    items: ItemProps[]
};
const PaymentProcessingPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ordersId: number[] = searchParams.get("ordersId")?.split("-").map(Number) ?? [];
    console.log("ordersId" + ordersId)
    useEffect(() => {
        const interval = setInterval(async () => {
            if (ordersId?.length == 0) {
                return;
            }
            try {
                console.log("orderid" + ordersId);
                const results = await Promise.all(
                    ordersId.map(id => orderService.getPaymentStatus(id))
                );
                const checkStatuses = results.every((r) => r.data.paymentStatus === 'paid')
                if (checkStatuses) {
                    clearInterval(interval);
                    // router.push(`/payment/success/${orderId}`);
                    router.push("/checkout/payment-confirmed");

                } else if (status === 'failed') {
                    clearInterval(interval);
                    toast('failed');
                    // router.push(`/payment/failed/${orderId}`);

                }
            } catch (err) {
                clearInterval(interval);
            }
        }, 2000);

        // Timeout 5 phút không xong thì báo failed
        const timeout = setTimeout(() => {
            clearInterval(interval);
            toast('failed');
            // router.push(`/payment/failed/${orderId}`);
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [ordersId]);
    // useEffect(() => {
    //     setTimeout(() => {
    //         router.push("/checkout/payment-confirmed");
    //     }, 5000);

    // })
    return (

        <Empty className="w-full min-h-screen flex flex-col items-center">
            <EmptyHeader>
                <EmptyMedia variant="icon" className=''>
                    <Spinner className='size-15' />
                </EmptyMedia>
                <EmptyTitle>Đang xử lý thanh toán</EmptyTitle>
                <EmptyDescription>
                    Đang xử lý thanh toán web sẽ chuyển sang trang khác sau khi xử lý thanh toán. Không được load lại hoặc tắt trang, trình duyệt.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="destructive" size="sm">
                    Bị lỗi?. Ấn nút này nếu load quá lâu
                </Button>
            </EmptyContent>
        </Empty>

    )
}

export default PaymentProcessingPage