import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export default function BadgeOrderStatus({
    status,
    paymentMethod,
    paymentStatus,
}: {
    status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled" | "returned";
    paymentMethod?: string;
    paymentStatus?: string;
}) {
    const isUnpaidOnline = status === "pending" && paymentMethod === "momo" && (paymentStatus === "processing" || paymentStatus === "pending");

    const statusStyle: Record<string, string> = {
        pending: isUnpaidOnline ? "bg-orange-300 text-orange-950" : "bg-yellow-300 text-yellow-900",
        confirmed: "bg-blue-300 text-blue-900",
        shipping: "bg-purple-300 text-purple-900",
        delivered: "bg-green-300 text-green-900",
        cancelled: "bg-red-300 text-red-900",
        returned: "bg-gray-300 text-gray-900",
    };

    const statusText: Record<string, string> = {
        pending: isUnpaidOnline ? "Chờ thanh toán" : "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao hàng",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        returned: "Đã hoàn hàng",
    };

    return (
        <Badge
            className={cn(
                "px-2 py-1 text-xs font-medium rounded-md",
                statusStyle[status] ?? "bg-gray-200 text-gray-800"
            )}
        >
            {statusText[status] ?? status}
        </Badge>
    );
}