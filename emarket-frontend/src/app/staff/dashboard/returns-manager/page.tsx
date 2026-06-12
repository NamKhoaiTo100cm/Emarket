"use client";

import { useEffect, useState } from "react";
import { orderService } from "@/services/order.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Undo2,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    User,
    Store,
    AlertCircle,
    Calendar,
    DollarSign,
    ClipboardList,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function ReturnsManagerPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // For resolution modal
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [resolveStatus, setResolveStatus] = useState<"APPROVED" | "REJECTED" | null>(null);
    const [staffNote, setStaffNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // For view detail modal
    const [detailRequest, setDetailRequest] = useState<any>(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await orderService.getReturnRequests();
            if (res) {
                setRequests(res.data || res || []);
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể tải danh sách yêu cầu hoàn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleResolve = async () => {
        if (!selectedRequest || !resolveStatus) return;
        setIsSubmitting(true);
        try {
            await orderService.resolveReturnRequest(selectedRequest.id, resolveStatus, staffNote);
            toast.success(resolveStatus === "APPROVED" ? "Đã duyệt và hoàn tiền tự động qua MoMo (Sandbox) thành công!" : "Đã từ chối yêu cầu hoàn tiền");
            setOpenDialog(false);
            setSelectedRequest(null);
            setResolveStatus(null);
            setStaffNote("");
            fetchRequests();
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra khi xử lý yêu cầu");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter requests
    const filteredRequests = requests.filter((req) => {
        const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;

        const orderIdStr = String(req.orderId);
        const buyerName = req.order?.user?.name?.toLowerCase() || "";
        const shopName = req.order?.shop?.name?.toLowerCase() || "";
        const reason = req.reason?.toLowerCase() || "";

        const matchesSearch =
            orderIdStr.includes(searchQuery) ||
            buyerName.includes(searchQuery.toLowerCase()) ||
            shopName.includes(searchQuery.toLowerCase()) ||
            reason.includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50 flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        <span>Chờ duyệt</span>
                    </Badge>
                );
            case "APPROVED":
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 flex items-center gap-1 w-fit">
                        <CheckCircle size={12} />
                        <span>Đã duyệt</span>
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50 flex items-center gap-1 w-fit">
                        <XCircle size={12} />
                        <span>Từ chối</span>
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Card stats
    const totalPending = requests.filter(r => r.status === "PENDING").length;
    const totalApproved = requests.filter(r => r.status === "APPROVED").length;
    const totalRejected = requests.filter(r => r.status === "REJECTED").length;
    const totalRefunded = requests
        .filter(r => r.status === "APPROVED")
        .reduce((sum, r) => sum + Number(r.order?.total || 0), 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    };

    return (
        <div className="space-y-6 p-1">
            {/* Header section */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Undo2 className="h-6 w-6 text-primary" />
                        Quản lý trả hàng & hoàn tiền
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Xem xét, phê duyệt hoặc từ chối các yêu cầu trả hàng từ phía người mua hàng.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Chờ phê duyệt</span>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{totalPending}</div>
                    <p className="text-xs text-muted-foreground mt-1">Yêu cầu cần xử lý ngay</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Đã chấp nhận</span>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{totalApproved}</div>
                    <p className="text-xs text-muted-foreground mt-1">Đơn hàng được chấp nhận hoàn tiền</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Đã từ chối</span>
                        <XCircle className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold text-rose-600">{totalRejected}</div>
                    <p className="text-xs text-muted-foreground mt-1">Yêu cầu bị từ chối</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <span className="text-sm font-medium text-muted-foreground">Tổng hoàn tiền</span>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(totalRefunded)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tổng giá trị đơn trả hàng thành công</p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-muted/30 p-4 rounded-xl border border-border">
                {/* Tabs Filter */}
                <div className="flex flex-wrap gap-1">
                    {[
                        { label: "Tất cả", value: "ALL" },
                        { label: "Chờ duyệt", value: "PENDING" },
                        { label: "Đã duyệt", value: "APPROVED" },
                        { label: "Từ chối", value: "REJECTED" },
                    ].map((tab) => (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? "default" : "ghost"}
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={() => setStatusFilter(tab.value)}
                        >
                            {tab.label}
                            {tab.value === "PENDING" && totalPending > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                                    {totalPending}
                                </span>
                            )}
                        </Button>
                    ))}
                </div>

                {/* Search box */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Tìm mã đơn, người mua, shop..."
                        className="pl-9 h-9 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Đang tải dữ liệu yêu cầu...</span>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ClipboardList className="h-12 w-12 text-muted-foreground mb-3 opacity-40" />
                        <h3 className="font-semibold text-lg">Không tìm thấy yêu cầu nào</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                            Hiện tại không có yêu cầu trả hàng nào phù hợp với bộ lọc đã chọn.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-16">ID</TableHead>
                                <TableHead className="w-24">Mã đơn hàng</TableHead>
                                <TableHead>Người mua</TableHead>
                                <TableHead>Cửa hàng</TableHead>
                                <TableHead className="max-w-[200px]">Lý do trả hàng</TableHead>
                                <TableHead>Tổng tiền</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((req) => (
                                <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-semibold text-xs">#{req.id}</TableCell>
                                    <TableCell className="text-xs">
                                        <span className="font-mono text-muted-foreground">#{req.orderId}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{req.order?.user?.name || "N/A"}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{req.order?.user?.phone || "N/A"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium">{req.order?.shop?.name || "N/A"}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                        {req.reason}
                                    </TableCell>
                                    <TableCell className="font-semibold text-sm text-orange-600">
                                        {formatCurrency(req.order?.total || 0)}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        <div className="flex flex-col">
                                            <span>{new Date(req.createdAt).toLocaleDateString("vi-VN")}</span>
                                            <span>{new Date(req.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(req.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg"
                                                title="Xem chi tiết"
                                                onClick={() => {
                                                    setDetailRequest(req);
                                                    setOpenDetailDialog(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>

                                            {req.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setResolveStatus("APPROVED");
                                                            setStaffNote("");
                                                            setOpenDialog(true);
                                                        }}
                                                    >
                                                        Duyệt
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setResolveStatus("REJECTED");
                                                            setStaffNote("");
                                                            setOpenDialog(true);
                                                        }}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Resolve Confirmation Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {resolveStatus === "APPROVED" ? (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-rose-500" />
                            )}
                            Xác nhận xử lý yêu cầu
                        </DialogTitle>
                        <DialogDescription>
                            {resolveStatus === "APPROVED"
                                ? "Bạn sắp PHÊ DUYỆT yêu cầu trả hàng. Hệ thống sẽ tự động hoàn tiền lại cho khách hàng qua ví điện tử MoMo (Sandbox), cập nhật đơn hàng thành 'returned' và trừ số dư tạm giữ của shop."
                                : "Bạn sắp TỪ CHỐI yêu cầu hoàn tiền cho đơn hàng này. Trạng thái đơn hàng sẽ giữ nguyên và số tiền sẽ tiếp tục được đối soát."}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-4 py-2 text-sm border-y border-border my-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mã đơn hàng:</span>
                                <span className="font-mono font-semibold">#{selectedRequest.orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Người mua hàng:</span>
                                <span className="font-semibold">{selectedRequest.order?.user?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cửa hàng bán:</span>
                                <span className="font-semibold">{selectedRequest.order?.shop?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tổng số tiền:</span>
                                <span className="font-semibold text-orange-600">{formatCurrency(selectedRequest.order?.total || 0)}</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-2">
                                <span className="text-muted-foreground">Lý do trả của khách:</span>
                                <p className="p-2.5 rounded-lg bg-muted text-xs italic">"{selectedRequest.reason}"</p>
                            </div>
                            {(selectedRequest.bankName || selectedRequest.bankAccount || selectedRequest.bankOwner) && (
                                <div className="mt-2.5 p-2.5 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200/40 rounded-lg text-xs space-y-1">
                                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">Tài khoản liên kết nhận tiền hoàn tự động (MoMo Sandbox):</span>
                                    <div className="mt-0.5">{selectedRequest.bankName} - <span className="font-mono font-semibold select-all text-primary">{selectedRequest.bankAccount}</span> ({selectedRequest.bankOwner})</div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2 py-2">
                        <Label htmlFor="staffNote" className="text-sm font-semibold">Ghi chú phản hồi khách hàng (Tùy chọn)</Label>
                        <Textarea
                            id="staffNote"
                            placeholder="Nhập lý do duyệt, từ chối hoặc các ghi chú khác cần gửi cho khách hàng..."
                            value={staffNote}
                            onChange={(e) => setStaffNote(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" disabled={isSubmitting}>Hủy</Button>
                        </DialogClose>
                        <Button
                            variant={resolveStatus === "APPROVED" ? "default" : "destructive"}
                            size="sm"
                            onClick={handleResolve}
                            disabled={isSubmitting}
                            className={resolveStatus === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0" : ""}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    Đang xử lý...
                                </>
                            ) : resolveStatus === "APPROVED" ? "Đồng ý hoàn tiền" : "Từ chối hoàn tiền"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-primary" />
                            Chi tiết yêu cầu hoàn tiền #{detailRequest?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {detailRequest && (
                        <div className="space-y-6 py-2">
                            {/* Order & Request Info Header */}
                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                                <div>
                                    <span className="text-xs text-muted-foreground block">MÃ YÊU CẦU</span>
                                    <span className="font-semibold font-mono text-sm">#{detailRequest.id}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">TRẠNG THÁI</span>
                                    <span className="mt-1 block">{getStatusBadge(detailRequest.status)}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">MÃ ĐƠN HÀNG LÊN QUAN</span>
                                    <span className="font-semibold font-mono text-sm">#{detailRequest.orderId}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">NGÀY TẠO YÊU CẦU</span>
                                    <span className="text-sm flex items-center gap-1.5 mt-0.5">
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                        {new Date(detailRequest.createdAt).toLocaleString("vi-VN")}
                                    </span>
                                </div>
                            </div>

                            {/* User & Shop Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-border space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 border-b border-border pb-1.5">
                                        <User className="h-4 w-4 text-primary" />
                                        Thông tin người mua
                                    </h4>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tên tài khoản:</span>
                                            <span className="font-medium">{detailRequest.order?.user?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Số điện thoại:</span>
                                            <span className="font-medium font-mono">{detailRequest.order?.user?.phone || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between flex-wrap gap-1">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium font-mono text-right">{detailRequest.order?.user?.email || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-border space-y-3">
                                    <h4 className="font-semibold text-sm flex items-center gap-2 border-b border-border pb-1.5">
                                        <Store className="h-4 w-4 text-primary" />
                                        Thông tin shop bán hàng
                                    </h4>
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tên shop:</span>
                                            <span className="font-medium">{detailRequest.order?.shop?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mã shop:</span>
                                            <span className="font-mono font-medium">#{detailRequest.order?.shopId}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items list */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm border-b border-border pb-1.5">Danh sách sản phẩm trong đơn</h4>
                                <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
                                    {detailRequest.order?.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-muted/40 border border-border/60">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium">{item.productName}</span>
                                                {item.variantName && (
                                                    <span className="text-muted-foreground text-[10px]">Phân loại: {item.variantName}</span>
                                                )}
                                                <span className="text-muted-foreground text-[10px]">Đơn giá: {formatCurrency(item.price)} x {item.quantity}</span>
                                            </div>
                                            <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center bg-muted/20 p-2.5 rounded-lg border border-border text-sm">
                                    <span className="font-semibold">Tổng giá trị đơn hàng:</span>
                                    <span className="font-bold text-orange-600">{formatCurrency(detailRequest.order?.total || 0)}</span>
                                </div>
                            </div>

                            {/* Reason details */}
                            <div className="space-y-2 p-4 rounded-xl border border-border bg-rose-50/20 dark:bg-rose-950/5">
                                <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                                    <ShieldAlert className="h-4 w-4" />
                                    Lý do yêu cầu trả hàng
                                </h4>
                                <p className="text-xs md:text-sm text-foreground/90 italic p-3 rounded-lg bg-background border border-border">
                                    "{detailRequest.reason}"
                                </p>
                            </div>

                            {/* Proof images */}
                            {detailRequest.images && detailRequest.images.length > 0 && (
                                <div className="space-y-2.5 p-4 rounded-xl border border-border bg-muted/40">
                                    <h4 className="font-semibold text-sm flex items-center gap-1.5 border-b border-border pb-1.5">
                                        <Eye className="h-4 w-4 text-primary" />
                                        Hình ảnh minh chứng ({detailRequest.images.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-3 mt-1.5">
                                        {detailRequest.images.map((imgUrl: string, idx: number) => (
                                            <a
                                                key={idx}
                                                href={imgUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="relative w-24 h-24 rounded-lg border border-border overflow-hidden block hover:opacity-90 hover:scale-[1.02] transition-all"
                                                title="Click để xem ảnh kích thước đầy đủ"
                                            >
                                                <Image src={imgUrl} alt="proof" width={100} height={100} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bank details for refund */}
                            {(detailRequest.bankName || detailRequest.bankAccount || detailRequest.bankOwner) && (
                                <div className="space-y-2.5 p-4 rounded-xl border border-border bg-emerald-50/15 dark:bg-emerald-950/5">
                                    <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 border-b border-border pb-1.5">
                                        <DollarSign className="h-4 w-4" />
                                        Thông tin nhận tiền hoàn của khách
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                                        <div>
                                            <span className="text-muted-foreground block text-[10px] uppercase">Ngân hàng</span>
                                            <span className="font-semibold">{detailRequest.bankName || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px] uppercase">Số tài khoản</span>
                                            <span className="font-semibold font-mono text-primary select-all">{detailRequest.bankAccount || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-[10px] uppercase">Chủ tài khoản</span>
                                            <span className="font-semibold uppercase">{detailRequest.bankOwner || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Staff Notes if Resolved */}
                            {detailRequest.status !== "PENDING" && (
                                <div className="space-y-2 p-4 rounded-xl border border-border bg-muted/40">
                                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                        Kết quả xử lý từ nhân viên hệ thống
                                    </h4>
                                    <div className="space-y-2 text-xs md:text-sm">
                                        <div className="flex gap-2 text-xs text-muted-foreground">
                                            <span>Ngày giải quyết: {new Date(detailRequest.updatedAt).toLocaleString("vi-VN")}</span>
                                        </div>
                                        {detailRequest.staffNote && (
                                            <p className="p-3 rounded-lg bg-background border border-border text-foreground/80 italic">
                                                "{detailRequest.staffNote}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary" size="sm">Đóng</Button>
                        </DialogClose>
                        {detailRequest?.status === "PENDING" && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                    onClick={() => {
                                        setOpenDetailDialog(false);
                                        setSelectedRequest(detailRequest);
                                        setResolveStatus("APPROVED");
                                        setStaffNote("");
                                        setOpenDialog(true);
                                    }}
                                >
                                    Phê duyệt
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                        setOpenDetailDialog(false);
                                        setSelectedRequest(detailRequest);
                                        setResolveStatus("REJECTED");
                                        setStaffNote("");
                                        setOpenDialog(true);
                                    }}
                                >
                                    Từ chối
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
