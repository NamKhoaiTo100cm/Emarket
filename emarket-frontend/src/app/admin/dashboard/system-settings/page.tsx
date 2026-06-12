"use client";

import { useEffect, useState } from "react";
import { systemConfigService } from "@/services/system-config.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Percent, Save, Settings, ShieldAlert, Loader2, Clock } from "lucide-react";

export default function SystemSettingsPage() {
    const [commissionRate, setCommissionRate] = useState<string>("5");
    const [autoConfirmMinutes, setAutoConfirmMinutes] = useState<string>("5");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const res = await systemConfigService.getConfigs();
            const configs = (res as any).data || res;
            if (Array.isArray(configs)) {
                const commission = configs.find(c => c.key === "commission_rate");
                if (commission) setCommissionRate(commission.value);

                const autoConfirm = configs.find(c => c.key === "auto_confirm_minutes");
                if (autoConfirm) setAutoConfirmMinutes(autoConfirm.value);
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể tải cấu hình hệ thống");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const rate = parseFloat(commissionRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toast.error("Phần trăm triết khấu phải là số từ 0 đến 100");
            return;
        }

        const mins = parseInt(autoConfirmMinutes, 10);
        if (isNaN(mins) || mins <= 0) {
            toast.error("Thời gian tự động xác nhận phải là số nguyên dương");
            return;
        }

        setIsSaving(true);
        try {
            await Promise.all([
                systemConfigService.updateConfig("commission_rate", commissionRate),
                systemConfigService.updateConfig("auto_confirm_minutes", autoConfirmMinutes),
            ]);
            toast.success("Cập nhật thiết lập hệ thống thành công");
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi cập nhật thiết lập");
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-medium text-sm">Đang tải thiết lập hệ thống...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
            <div className="border-b pb-5">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                    <Settings className="w-8 h-8 text-primary" />
                    Thiết lập hệ thống
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Cấu hình các tham số vận hành cho toàn bộ sàn giao dịch Emarket.
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="shadow-xs hover:border-muted-foreground/30 transition-all duration-300">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Triết khấu doanh thu (Commission Rate)</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                            Tỷ lệ phần trăm phí hoa hồng hệ thống giữ lại từ tổng giá trị đơn hàng khi tiền được mở khóa chuyển từ số dư đang chờ sang số dư khả dụng của Shop (sau 3 ngày kể từ lúc giao hàng thành công).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="commission_rate" className="text-sm font-semibold">Tỷ lệ phần trăm (%)</Label>
                            <div className="flex items-center gap-3 max-w-[200px]">
                                <Input
                                    id="commission_rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="any"
                                    value={commissionRate}
                                    onChange={(e) => setCommissionRate(e.target.value)}
                                    className="text-sm font-medium pr-8"
                                    required
                                />
                                <span className="text-sm font-semibold text-muted-foreground">%</span>
                            </div>
                        </div>

                        <div className="flex gap-2.5 items-start bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm leading-relaxed mt-4">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Lưu ý quan trọng:</span>
                                <p className="mt-1 text-muted-foreground">
                                    Thay đổi này sẽ áp dụng ngay lập tức cho toàn bộ các đơn hàng chưa thanh toán/chưa mở khóa (settled) trên sàn Emarket. Hãy kiểm tra kỹ lưỡng trước khi lưu.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs hover:border-muted-foreground/30 transition-all duration-300">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg font-bold">Tự động xác nhận nhận hàng</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                            Thời gian (tính bằng phút) mà hệ thống chờ người mua xác nhận nhận hàng. Sau khoảng thời gian này, đơn hàng sẽ tự động chuyển sang trạng thái "Đã giao hàng" để bảo vệ quyền lợi người bán.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="auto_confirm_minutes" className="text-sm font-semibold">Thời gian chờ (phút)</Label>
                            <div className="flex items-center gap-3 max-w-[200px]">
                                <Input
                                    id="auto_confirm_minutes"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={autoConfirmMinutes}
                                    onChange={(e) => setAutoConfirmMinutes(e.target.value)}
                                    className="text-sm font-medium pr-8"
                                    required
                                />
                                <span className="text-sm font-semibold text-muted-foreground">phút</span>
                            </div>
                        </div>

                        <div className="flex gap-2.5 items-start bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-4 rounded-xl text-sm leading-relaxed mt-4">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Lưu ý:</span>
                                <p className="mt-1 text-muted-foreground">
                                    Nên đặt thấp (5–10 phút) khi demo, và cao hơn (3–7 ngày = 4320–10080 phút) khi triển khai thực tế.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end">
                    <Button type="submit" disabled={isSaving} className="gap-2 px-5 py-2 font-semibold">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu thiết lập...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Lưu thiết lập
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
