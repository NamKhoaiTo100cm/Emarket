"use client"
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, Clock, ArrowDownCircle } from "lucide-react";
import { withdrawalService } from "@/services/withdrawal.service";

const BANKS = [
    "Vietcombank", "Techcombank", "BIDV", "Agribank",
    "MB Bank", "VPBank", "TPBank", "ACB", "Sacombank",
];

const statusMap = {
    PENDING: { label: "Chờ duyệt", variant: "secondary" },
    APPROVED: { label: "Đã duyệt", variant: "success" },
    REJECTED: { label: "Từ chối", variant: "destructive" },
} as const;

export default function SellerBalancePage() {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        amount: "",
        bankName: BANKS[0],
        bankAccount: "",
        accountHolder: "",
    });

    const { data: balanceData, isLoading: balanceLoading } = useQuery({
        queryKey: ["seller-balance"],
        queryFn: () => withdrawalService.getBalance(),
    });

    const { data: requestsData, isLoading: requestsLoading } = useQuery({
        queryKey: ["seller-withdrawal-requests"],
        queryFn: () => withdrawalService.getMyRequests(),
    });

    const { mutate: createRequest, isPending } = useMutation({
        mutationFn: () => withdrawalService.createRequest({
            amount: Number(form.amount),
            bankName: form.bankName,
            bankAccount: form.bankAccount,
            accountHolder: form.accountHolder,
        }),
        onSuccess: () => {
            toast.success("Rút tiền thành công! Tiền đã được chuyển tự động qua ví MoMo (Sandbox)");
            setForm({ amount: "", bankName: BANKS[0], bankAccount: "", accountHolder: "" });
            queryClient.invalidateQueries({ queryKey: ["seller-balance"] });
            queryClient.invalidateQueries({ queryKey: ["seller-withdrawal-requests"] });
        },
        onError: (err: any) => {
            toast.error(err.message || "Có lỗi xảy ra");
        },
    });

    const balance = balanceData?.data;

    const onSubmit = () => {
        if (!form.amount || Number(form.amount) < 10000) {
            toast.error("Số tiền tối thiểu 10.000đ");
            return;
        }
        if (!form.bankAccount || !form.accountHolder) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }
        createRequest();
    };

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">Quản lý số dư</h1>

            {/* Balance cards */}
            <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <Wallet className="size-10 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Số dư khả dụng</p>
                            <p className="text-2xl font-bold text-green-600">
                                {balanceLoading ? "..." : Number(balance?.balance ?? 0).toLocaleString("vi-VN")}đ
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 pt-6">
                        <Clock className="size-10 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Đang chờ xử lý</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {balanceLoading ? "..." : Number(balance?.pendingBalance ?? 0).toLocaleString("vi-VN")}đ
                            </p>
                            <p className="text-xs text-muted-foreground">Sẽ khả dụng sau 3 ngày kể từ khi giao hàng</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Withdrawal form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowDownCircle className="size-5" />
                        Yêu cầu rút tiền
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Số tiền rút</Label>
                            <Input
                                type="number"
                                placeholder="Tối thiểu 10.000đ"
                                value={form.amount}
                                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ngân hàng</Label>
                            <select
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={form.bankName}
                                onChange={e => setForm(p => ({ ...p, bankName: e.target.value }))}
                            >
                                {BANKS.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Số tài khoản</Label>
                            <Input
                                placeholder="Nhập số tài khoản"
                                value={form.bankAccount}
                                onChange={e => setForm(p => ({ ...p, bankAccount: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tên chủ tài khoản</Label>
                            <Input
                                placeholder="Nguyễn Văn A"
                                value={form.accountHolder}
                                onChange={e => setForm(p => ({ ...p, accountHolder: e.target.value }))}
                            />
                        </div>
                    </div>

                    <Button onClick={onSubmit} disabled={isPending} className="w-full">
                        {isPending ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
                    </Button>
                </CardContent>
            </Card>

            {/* Request history */}
            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                    {requestsLoading ? (
                        <p className="text-center text-muted-foreground py-4">Đang tải...</p>
                    ) : requestsData?.data?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">Chưa có yêu cầu nào</p>
                    ) : (
                        <div className="space-y-3">
                            {requestsData?.data?.map((req: any) => (
                                <Card key={req.id} className="px-4 py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-green-600">
                                                {Number(req.amount).toLocaleString("vi-VN")}đ
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {req.bankName} — {req.bankAccount}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {req.accountHolder}
                                            </p>
                                            {req.note && (
                                                <p className="text-sm text-red-500">Lý do: {req.note}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Badge variant={statusMap[req.status as keyof typeof statusMap]?.variant as any}>
                                                {statusMap[req.status as keyof typeof statusMap]?.label}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}