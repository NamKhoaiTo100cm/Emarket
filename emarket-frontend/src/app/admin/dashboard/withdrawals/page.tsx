// app/admin/withdrawals/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withdrawalService } from "@/services/withdrawal.service";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Wallet, CheckCircle, XCircle, AlertCircle, Landmark } from "lucide-react";
import Image from "next/image";
import { formatDate, formatTime, formatDateTime } from "@/lib/date";

const statusMap = {
    PENDING: { label: "Chờ duyệt", variant: "secondary" },
    APPROVED: { label: "Đã duyệt", variant: "success" },
    REJECTED: { label: "Từ chối", variant: "destructive" },
} as const;

export default function AdminWithdrawalsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>("APPROVED");
    const [selected, setSelected] = useState<any>(null);
    const [rejectNote, setRejectNote] = useState("");
    const [dialogType, setDialogType] = useState<"approve" | "reject" | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-withdrawals", statusFilter],
        queryFn: () => withdrawalService.getAdminList(statusFilter),
    });

    const { mutate: resolve, isPending } = useMutation({
        mutationFn: () => withdrawalService.resolveRequest(
            selected.id,
            dialogType === "approve" ? "APPROVED" : "REJECTED",
            dialogType === "reject" ? rejectNote : undefined,
        ),
        onSuccess: () => {
            toast.success(dialogType === "approve" ? "Đã duyệt yêu cầu rút tiền thành công" : "Đã từ chối yêu cầu rút tiền");
            setSelected(null);
            setDialogType(null);
            setRejectNote("");
            queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
        },
        onError: (err: any) => toast.error(err.message || "Có lỗi xảy ra khi xử lý"),
    });

    const requests = data?.data ?? [];

    const formatVND = (value: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border border-dashed rounded-xl bg-muted/20 m-4">
                <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                <h3 className="text-lg font-semibold">Lỗi tải yêu cầu rút tiền</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Landmark className="w-8 h-8 text-primary" />
                        Quản lý yêu cầu rút tiền
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Lịch sử các yêu cầu rút tiền từ số dư của các cửa hàng. Hệ thống tự động chuyển khoản qua ví điện tử MoMo (API Sandbox).
                    </p>
                </div>
            </div>

            {/* Main Table Card */}
            <Card className="border shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-muted-foreground" />
                                Danh sách yêu cầu
                            </CardTitle>
                        </div>
                        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
                            <TabsList className="grid grid-cols-3 w-full sm:w-[320px]">
                                <TabsTrigger value="PENDING" className="text-sm font-semibold">Chờ duyệt</TabsTrigger>
                                <TabsTrigger value="APPROVED" className="text-sm font-semibold">Đã duyệt</TabsTrigger>
                                <TabsTrigger value="REJECTED" className="text-sm font-semibold">Từ chối</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="mt-3 text-sm text-muted-foreground">Đang tải danh sách yêu cầu...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                            <AlertCircle className="w-12 h-12 opacity-30 mb-2" />
                            <p className="text-sm font-medium">Không tìm thấy yêu cầu rút tiền nào</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-semibold text-sm py-3 pl-4">Cửa hàng</TableHead>
                                        <TableHead className="font-semibold text-sm py-3">Số tiền rút</TableHead>
                                        <TableHead className="font-semibold text-sm py-3 min-w-[220px]">Thông tin chuyển khoản</TableHead>
                                        <TableHead className="font-semibold text-sm py-3">Ngày yêu cầu</TableHead>
                                        <TableHead className="font-semibold text-sm py-3 text-center">Trạng thái</TableHead>
                                        <TableHead className="font-semibold text-sm py-3 text-right pr-4">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((req: any) => (
                                        <TableRow key={req.id} className="hover:bg-muted/10 transition-colors">
                                            <TableCell className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg border bg-muted flex items-center justify-center font-bold text-sm uppercase text-muted-foreground shrink-0 overflow-hidden relative">
                                                        {req.shop?.logo ? (
                                                            <Image
                                                                src={req.shop.logo}
                                                                alt={req.shop?.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            req.shop?.name?.substring(0, 2) || "SP"
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col max-w-[180px]">
                                                        <span className="font-bold text-sm text-foreground line-clamp-1">{req.shop?.name}</span>
                                                        <span className="text-xs text-muted-foreground">ID Shop: {req.shopId}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-500">
                                                    {formatVND(Number(req.amount))}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="text-sm space-y-1 text-muted-foreground max-w-[240px]">
                                                    <p>Ngân hàng: <strong className="text-foreground">{req.bankName}</strong></p>
                                                    <p>Số tài khoản: <strong className="font-mono text-foreground">{req.bankAccount}</strong></p>
                                                    <p>Chủ tài khoản: <strong className="text-foreground">{req.accountHolder}</strong></p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-sm text-muted-foreground">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold">{formatDate(req.createdAt)}</span>
                                                    <span className="text-xs opacity-75">{formatTime(req.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-center">
                                                <div className="inline-flex justify-center w-full">
                                                    <Badge className="font-semibold text-xs px-2.5 py-0.5 rounded-full" variant={statusMap[req.status as keyof typeof statusMap]?.variant as any}>
                                                        {statusMap[req.status as keyof typeof statusMap]?.label}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-right pr-4">
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    {req.resolvedAt && (
                                                        <p className="text-xs font-semibold text-foreground">Đã chuyển: {formatDateTime(req.resolvedAt)}</p>
                                                    )}
                                                    {req.note && (
                                                        <p className="text-xs text-muted-foreground italic max-w-[200px] truncate ml-auto" title={req.note}>
                                                            {req.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Approve dialog */}
            <Dialog open={dialogType === "approve"} onOpenChange={() => { setDialogType(null); setSelected(null); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            Xác nhận duyệt chuyển khoản
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4 text-sm border-y my-2">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Cửa hàng:</span>
                            <span className="col-span-2 font-bold text-foreground">{selected?.shop?.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Số tiền rút:</span>
                            <span className="col-span-2 font-extrabold text-emerald-600 text-base">{formatVND(selected?.amount ?? 0)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Ngân hàng:</span>
                            <span className="col-span-2 font-semibold text-foreground">{selected?.bankName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Số tài khoản:</span>
                            <span className="col-span-2 font-mono font-bold text-foreground">{selected?.bankAccount}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Chủ tài khoản:</span>
                            <span className="col-span-2 font-semibold text-foreground uppercase">{selected?.accountHolder}</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg leading-relaxed">
                        Lưu ý: Xác nhận rằng bạn đã thực hiện chuyển khoản thành công theo các thông tin ngân hàng ở trên trước khi bấm xác nhận duyệt.
                    </p>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" className="font-semibold" onClick={() => { setDialogType(null); setSelected(null); }}>
                            Huỷ
                        </Button>
                        <Button className="font-semibold bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => resolve()} disabled={isPending}>
                            {isPending ? "Đang xử lý..." : "Xác nhận duyệt"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject dialog */}
            <Dialog open={dialogType === "reject"} onOpenChange={() => { setDialogType(null); setSelected(null); setRejectNote(""); }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-destructive">
                            <XCircle className="w-5 h-5" />
                            Từ chối yêu cầu rút tiền
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-4 text-sm border-y my-2">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Cửa hàng:</span>
                            <span className="col-span-2 font-bold text-foreground">{selected?.shop?.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-muted-foreground">Số tiền yêu cầu:</span>
                            <span className="col-span-2 font-bold text-foreground">{formatVND(selected?.amount ?? 0)}</span>
                        </div>
                        <div className="space-y-2 mt-3 pt-2">
                            <Label htmlFor="reject-note" className="text-sm font-bold uppercase text-muted-foreground">Lý do từ chối</Label>
                            <Input
                                id="reject-note"
                                placeholder="Ví dụ: Thông tin tài khoản không hợp lệ..."
                                value={rejectNote}
                                onChange={e => setRejectNote(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="outline" className="font-semibold" onClick={() => { setDialogType(null); setSelected(null); setRejectNote(""); }}>
                            Huỷ
                        </Button>
                        <Button variant="destructive" className="font-semibold" onClick={() => resolve()} disabled={isPending || !rejectNote}>
                            {isPending ? "Đang xử lý..." : "Từ chối yêu cầu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}