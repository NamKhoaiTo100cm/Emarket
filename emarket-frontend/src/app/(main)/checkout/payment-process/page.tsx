"use client"

import { Suspense, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { orderService } from "@/services/order.service";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const PaymentProcessingContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const ordersId = useMemo(() => {
        return searchParams.get("ordersId")?.split("-").map(Number).filter(Boolean) ?? [];
    }, [searchParams]);

    useEffect(() => {
        if (ordersId.length === 0) {
            toast("Không tìm thấy mã đơn hàng");
            return;
        }

        const interval = setInterval(async () => {
            try {
                const results = await Promise.all(
                    ordersId.map((id) => orderService.getPaymentStatus(id))
                );

                const allPaid = results.every(
                    (r) => r.data.paymentStatus === "paid"
                );

                const anyFailed = results.some(
                    (r) => r.data.paymentStatus === "failed"
                );

                if (allPaid) {
                    clearInterval(interval);
                    router.push("/checkout/payment-confirmed");
                }

                if (anyFailed) {
                    clearInterval(interval);
                    toast("Thanh toán thất bại");
                    // router.push("/checkout/payment-failed");
                }
            } catch (err) {
                clearInterval(interval);
                toast("Có lỗi khi kiểm tra trạng thái thanh toán");
            }
        }, 2000);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            toast("Thanh toán quá thời gian xử lý");
            // router.push("/checkout/payment-failed");
        }, 5 * 60 * 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [ordersId, router]);

    return (
        <Empty className="w-full min-h-screen flex flex-col items-center">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Spinner className="size-15" />
                </EmptyMedia>

                <EmptyTitle>Đang xử lý thanh toán</EmptyTitle>

                <EmptyDescription>
                    Đang xử lý thanh toán, web sẽ chuyển sang trang khác sau khi xử lý xong.
                    Không được load lại hoặc tắt trang, trình duyệt.
                </EmptyDescription>
            </EmptyHeader>

            <EmptyContent>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => router.push("/checkout")}
                >
                    Bị lỗi? Ấn nút này nếu load quá lâu
                </Button>
            </EmptyContent>
        </Empty>
    );
};

const PaymentProcessingPage = () => {
    return (
        <Suspense
            fallback={
                <Empty className="w-full min-h-screen flex flex-col items-center">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Spinner className="size-15" />
                        </EmptyMedia>
                        <EmptyTitle>Đang tải...</EmptyTitle>
                    </EmptyHeader>
                </Empty>
            }
        >
            <PaymentProcessingContent />
        </Suspense>
    );
};

export default PaymentProcessingPage;