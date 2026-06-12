"use client";

import { useState } from "react";
import { useMe } from "@/components/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Flag, AlertTriangle } from "lucide-react";
import { reportService } from "@/services/report.service";

interface ReportButtonProps {
    type: "product" | "review" | "shop";
    targetId: number;
    variant?: "button" | "icon";
    className?: string;
}

const PREDEFINED_REASONS = {
    product: [
        "Hàng giả, hàng nhái, vi phạm sở hữu trí tuệ",
        "Lừa đảo, hàng không đúng mô tả",
        "Sản phẩm cấm, nội dung phản cảm",
        "Giá cả không hợp lý, có dấu hiệu lừa đảo",
    ],
    shop: [
        "Cửa hàng lừa đảo khách hàng",
        "Bán hàng giả, hàng nhái quy mô lớn",
        "Thái độ phục vụ khiếm nhã, xúc phạm người mua",
        "Có hành vi gian lận điểm đánh giá",
    ],
    review: [
        "Spam, quảng cáo không liên quan",
        "Ngôn từ thô tục, xúc phạm người khác",
        "Đánh giá sai sự thật, cố ý bôi nhọ uy tín",
        "Nội dung chứa thông tin cá nhân nhạy cảm",
    ],
};

export default function ReportButton({ type, targetId, variant = "button", className = "" }: ReportButtonProps) {
    const { data: userData } = useMe();
    const [open, setOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");
    const [customReason, setCustomReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLoggedIn = !!userData?.data;

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && !isLoggedIn) {
            toast.error("Vui lòng đăng nhập để thực hiện báo cáo!");
            return;
        }
        setOpen(isOpen);
        if (isOpen) {
            setSelectedReason("");
            setCustomReason("");
        }
    };

    const handleSubmit = async () => {
        const finalReason = selectedReason === "other" ? customReason.trim() : selectedReason;
        if (!finalReason) {
            toast.error("Vui lòng chọn hoặc nhập lý do báo cáo");
            return;
        }

        setIsSubmitting(true);
        try {
            await reportService.createReport({
                type,
                targetId,
                reason: finalReason,
            });
            toast.success("Báo cáo của bạn đã được gửi thành công. Chúng tôi sẽ xem xét sớm nhất có thể.");
            setOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Không thể gửi báo cáo. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeLabels = {
        product: "Sản phẩm",
        shop: "Cửa hàng",
        review: "Bình luận/Đánh giá",
    };

    const reasons = PREDEFINED_REASONS[type] || [];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {variant === "icon" ? (
                    <button
                        className={`text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-muted ${className}`}
                        title={`Báo cáo ${typeLabels[type].toLowerCase()}`}
                    >
                        <Flag className="size-4" />
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className={`text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/20 text-xs font-semibold flex items-center gap-1.5 ${className}`}
                    >
                        <AlertTriangle className="size-3.5" />
                        Báo cáo {typeLabels[type].toLowerCase()}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <AlertTriangle className="size-5 text-rose-500" />
                        Báo cáo {typeLabels[type].toLowerCase()}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-3 text-sm">
                    <p className="text-muted-foreground leading-relaxed text-xs">
                        Hãy chọn lý do báo cáo thích hợp. Hành vi báo cáo sai sự thật hoặc lạm dụng có thể bị xử lý theo quy định của hệ thống.
                    </p>

                    <div className="space-y-2.5">
                        {reasons.map((r) => (
                            <label
                                key={r}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/40 transition-colors ${
                                    selectedReason === r ? "border-rose-500 bg-rose-500/5" : "border-border"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="report-reason"
                                    value={r}
                                    checked={selectedReason === r}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="mt-1 accent-rose-500"
                                />
                                <span className="text-xs font-medium text-foreground">{r}</span>
                            </label>
                        ))}

                        <label
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/40 transition-colors ${
                                selectedReason === "other" ? "border-rose-500 bg-rose-500/5" : "border-border"
                            }`}
                        >
                            <input
                                type="radio"
                                name="report-reason"
                                value="other"
                                checked={selectedReason === "other"}
                                onChange={() => setSelectedReason("other")}
                                className="mt-1 accent-rose-500"
                            />
                            <span className="text-xs font-medium text-foreground">Lý do khác...</span>
                        </label>
                    </div>

                    {selectedReason === "other" && (
                        <div className="space-y-1.5 animate-fadeIn">
                            <Label htmlFor="custom-reason" className="text-xs font-semibold text-muted-foreground uppercase">Chi tiết lý do báo cáo</Label>
                            <Textarea
                                id="custom-reason"
                                placeholder="Vui lòng nhập chi tiết lý do báo cáo..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                rows={3}
                                className="text-xs"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Huỷ
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedReason || (selectedReason === "other" && !customReason.trim())}
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
