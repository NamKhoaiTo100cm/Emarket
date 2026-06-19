"use client";

import { useEffect, useState } from "react";
import { reportService } from "@/services/report.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    Store,
    ShoppingBag,
    MessageSquare,
    Loader2,
    Calendar,
    User,
    ShieldAlert,
    History,
} from "lucide-react";
import Image from "next/image";
import { formatDate, formatTime, formatDateTime } from "@/lib/date";

export default function ReportsManagerPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("product");

    // Detail dialog state
    const [detailTarget, setDetailTarget] = useState<{ type: string; id: number; name: string } | null>(null);
    const [details, setDetails] = useState<any[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);

    // Action execution state
    const [isResolving, setIsResolving] = useState(false);

    // History log state
    const [history, setHistory] = useState<any[]>([]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await reportService.getStats();
            setStats(res.data || res);
        } catch (error: any) {
            toast.error(error.message || "Không thể tải số liệu thống kê báo cáo");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await reportService.getHistory();
            setHistory(res.data || res || []);
        } catch (error: any) {
            toast.error(error.message || "Không thể tải lịch sử xử lý báo cáo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        } else {
            fetchStats();
        }
    }, [activeTab]);

    const handleViewReasons = async (type: string, id: number, name: string) => {
        setDetailTarget({ type, id, name });
        setDetailOpen(true);
        setDetailsLoading(true);
        try {
            const res = await reportService.getDetails(type, id);
            setDetails(res.data || res || []);
        } catch (error: any) {
            toast.error(error.message || "Không thể tải chi tiết lý do báo cáo");
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleResolve = async (type: string, targetId: number, action: "ban" | "hide" | "dismiss") => {
        const actionLabels = {
            ban: "Khóa",
            hide: "Ẩn",
            dismiss: "Bỏ qua",
        };

        if (!confirm(`Bạn có chắc chắn muốn ${actionLabels[action].toLowerCase()} mục bị báo cáo này?`)) {
            return;
        }

        setIsResolving(true);
        try {
            await reportService.resolveReport({ type, targetId, action });
            toast.success("Xử lý báo cáo thành công");
            setDetailOpen(false);
            fetchStats();
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra khi xử lý báo cáo");
        } finally {
            setIsResolving(false);
        }
    };

    const getStatusBadge = (status: string, isHidden?: boolean) => {
        if (isHidden === true) {
            return <Badge variant="destructive">Đang bị ẩn</Badge>;
        }
        switch (status) {
            case "active":
                return <Badge variant="default">Hoạt động</Badge>;
            case "inactive":
                return <Badge variant="secondary">Không hoạt động</Badge>;
            case "banned":
                return <Badge variant="destructive">Đang bị khóa</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTabCount = (type: string) => {
        if (!stats) return 0;
        if (type === "product") return stats.reportedProducts?.length || 0;
        if (type === "review") return stats.reportedReviews?.length || 0;
        if (type === "shop") return stats.reportedShops?.length || 0;
        return 0;
    };

    return (
        <div className="w-full space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-2 border-b pb-5">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                    Quản lý báo cáo vi phạm
                </h1>
                <p className="text-muted-foreground text-sm">
                    Xem xét và xử lý các báo cáo vi phạm về sản phẩm, đánh giá của người dùng và cửa hàng.
                </p>
            </div>

            {/* Main Tabs Container */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full sm:w-[640px]">
                    <TabsTrigger value="product" className="text-sm font-semibold flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" />
                        Sản phẩm ({getTabCount("product")})
                    </TabsTrigger>
                    <TabsTrigger value="review" className="text-sm font-semibold flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        Bình luận ({getTabCount("review")})
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="text-sm font-semibold flex items-center gap-1.5">
                        <Store className="w-4 h-4" />
                        Cửa hàng ({getTabCount("shop")})
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm font-semibold flex items-center gap-1.5">
                        <History className="w-4 h-4" />
                        Lịch sử xử lý
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Đang tải danh sách báo cáo...</p>
                    </div>
                ) : (
                    <>
                        {/* Tab Content: Products */}
                        <TabsContent value="product" className="mt-4">
                            <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
                                {!stats?.reportedProducts || stats.reportedProducts.length === 0 ? (
                                    <p className="text-center py-16 text-muted-foreground text-sm font-medium">Không có sản phẩm nào bị báo cáo</p>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Sản phẩm (ID)</TableHead>
                                                <TableHead className="text-center">Số lượt báo cáo</TableHead>
                                                <TableHead>Cửa hàng</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="text-right">Hành động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stats.reportedProducts.map((p: any) => (
                                                <TableRow key={p.productId} className="hover:bg-muted/10">
                                                    <TableCell className="font-semibold text-sm">
                                                        {p.productName} <span className="text-xs text-muted-foreground font-mono">(#{p.productId})</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="destructive" className="font-bold text-xs px-2 py-0.5 rounded-full">
                                                            {p.reportCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-sm">{p.shopName}</TableCell>
                                                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 font-semibold text-xs flex items-center gap-1"
                                                                onClick={() => handleViewReasons("product", p.productId, p.productName)}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> Xem lý do
                                                            </Button>
                                                            {p.status !== "banned" && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="h-8 font-semibold text-xs flex items-center gap-1"
                                                                        onClick={() => handleResolve("product", p.productId, "ban")}
                                                                        disabled={isResolving}
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" /> Khóa
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 border-0"
                                                                        onClick={() => handleResolve("product", p.productId, "dismiss")}
                                                                        disabled={isResolving}
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Bỏ qua
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
                        </TabsContent>

                        {/* Tab Content: Reviews */}
                        <TabsContent value="review" className="mt-4">
                            <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
                                {!stats?.reportedReviews || stats.reportedReviews.length === 0 ? (
                                    <p className="text-center py-16 text-muted-foreground text-sm font-medium">Không có bình luận nào bị báo cáo</p>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Nội dung đánh giá</TableHead>
                                                <TableHead className="text-center">Số lượt báo cáo</TableHead>
                                                <TableHead>Người viết</TableHead>
                                                <TableHead>Sản phẩm liên quan</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="text-right">Hành động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stats.reportedReviews.map((r: any) => (
                                                <TableRow key={r.reviewId} className="hover:bg-muted/10">
                                                    <TableCell className="max-w-[240px] truncate text-sm italic">
                                                        "{r.comment}"
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="destructive" className="font-bold text-xs px-2 py-0.5 rounded-full">
                                                            {r.reportCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm font-semibold">{r.reviewerName}</TableCell>
                                                    <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                                                        {r.productName}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge("", r.isHidden)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 font-semibold text-xs flex items-center gap-1"
                                                                onClick={() => handleViewReasons("review", r.reviewId, r.comment)}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> Xem lý do
                                                            </Button>
                                                            {!r.isHidden && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="h-8 font-semibold text-xs flex items-center gap-1"
                                                                        onClick={() => handleResolve("review", r.reviewId, "hide")}
                                                                        disabled={isResolving}
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" /> Ẩn
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 border-0"
                                                                        onClick={() => handleResolve("review", r.reviewId, "dismiss")}
                                                                        disabled={isResolving}
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Bỏ qua
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
                        </TabsContent>

                        {/* Tab Content: Shops */}
                        <TabsContent value="shop" className="mt-4">
                            <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
                                {!stats?.reportedShops || stats.reportedShops.length === 0 ? (
                                    <p className="text-center py-16 text-muted-foreground text-sm font-medium">Không có cửa hàng nào bị báo cáo</p>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Cửa hàng (ID)</TableHead>
                                                <TableHead className="text-center">Số lượt báo cáo</TableHead>
                                                <TableHead>Địa chỉ</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="text-right">Hành động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stats.reportedShops.map((s: any) => (
                                                <TableRow key={s.shopId} className="hover:bg-muted/10">
                                                    <TableCell className="font-semibold text-sm">
                                                        {s.shopName} <span className="text-xs text-muted-foreground font-mono">(#{s.shopId})</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="destructive" className="font-bold text-xs px-2 py-0.5 rounded-full">
                                                            {s.reportCount}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                        {s.address}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(s.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 font-semibold text-xs flex items-center gap-1"
                                                                onClick={() => handleViewReasons("shop", s.shopId, s.shopName)}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> Xem lý do
                                                            </Button>
                                                            {s.status !== "banned" && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="h-8 font-semibold text-xs flex items-center gap-1"
                                                                        onClick={() => handleResolve("shop", s.shopId, "ban")}
                                                                        disabled={isResolving}
                                                                    >
                                                                        <XCircle className="w-3.5 h-3.5" /> Khóa
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-8 font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 border-0"
                                                                        onClick={() => handleResolve("shop", s.shopId, "dismiss")}
                                                                        disabled={isResolving}
                                                                    >
                                                                        <CheckCircle className="w-3.5 h-3.5" /> Bỏ qua
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
                        </TabsContent>

                        {/* Tab Content: History */}
                        <TabsContent value="history" className="mt-4">
                            <div className="border rounded-xl overflow-hidden bg-card shadow-xs">
                                {history.length === 0 ? (
                                    <p className="text-center py-16 text-muted-foreground text-sm font-medium">Không có lịch sử xử lý báo cáo</p>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead>Đối tượng bị báo cáo</TableHead>
                                                <TableHead>Người báo cáo & Lý do</TableHead>
                                                <TableHead>Quyết định</TableHead>
                                                <TableHead>Người xử lý</TableHead>
                                                <TableHead className="text-right">Thời gian xử lý</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.map((item: any) => {
                                                const getTargetDisplay = () => {
                                                    if (item.type === "product") {
                                                        return (
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center gap-1 font-semibold text-sm text-foreground">
                                                                    <ShoppingBag className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                                    <span className="truncate max-w-[150px]" title={item.product?.name}>{item.product?.name || "(Sản phẩm đã bị xóa)"}</span>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground font-mono block">ID: #{item.productId}</span>
                                                            </div>
                                                        );
                                                    }
                                                    if (item.type === "shop") {
                                                        return (
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center gap-1 font-semibold text-sm text-foreground">
                                                                    <Store className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                                                    <span className="truncate max-w-[150px]" title={item.shop?.name}>{item.shop?.name || "(Cửa hàng đã bị xóa)"}</span>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground font-mono block">ID: #{item.shopId}</span>
                                                            </div>
                                                        );
                                                    }
                                                    if (item.type === "review") {
                                                        return (
                                                            <div className="space-y-0.5">
                                                                <div className="flex items-center gap-1 font-semibold text-sm text-foreground">
                                                                    <MessageSquare className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                                                                    <span className="truncate max-w-[150px] italic font-normal text-muted-foreground" title={item.review?.comment}>
                                                                        "{item.review?.comment || "(Bình luận đã bị ẩn/xóa)"}"
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground font-mono block">ID: #{item.reviewId}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                };

                                                const getDecisionBadge = () => {
                                                    if (item.status === "dismissed") {
                                                        return (
                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                Bỏ qua
                                                            </Badge>
                                                        );
                                                    }
                                                    if (item.status === "resolved") {
                                                        if (item.type === "product") return <Badge variant="destructive">Khóa sản phẩm</Badge>;
                                                        if (item.type === "shop") return <Badge variant="destructive">Khóa cửa hàng</Badge>;
                                                        if (item.type === "review") return <Badge variant="destructive">Ẩn bình luận</Badge>;
                                                    }
                                                    return <Badge variant="outline">{item.status}</Badge>;
                                                };

                                                return (
                                                    <TableRow key={item.id} className="hover:bg-muted/10">
                                                        <TableCell className="max-w-[200px]">
                                                            {getTargetDisplay()}
                                                        </TableCell>
                                                        <TableCell className="max-w-[280px]">
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-xs text-foreground">
                                                                    {item.user?.name || "N/A"}{" "}
                                                                    <span className="text-muted-foreground font-mono font-normal">({item.user?.email})</span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground italic bg-muted/30 p-1.5 rounded-md border border-muted-foreground/10 line-clamp-2" title={item.reason}>
                                                                    "{item.reason}"
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{getDecisionBadge()}</TableCell>
                                                        <TableCell>
                                                            {item.resolver ? (
                                                                <div className="text-xs">
                                                                    <div className="font-semibold text-foreground">{item.resolver.name}</div>
                                                                    <div className="text-muted-foreground font-mono text-[10px]">{item.resolver.email}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">N/A</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right text-xs text-muted-foreground font-medium">
                                                            {item.resolvedAt ? (
                                                                <div className="space-y-0.5">
                                                                    <div className="flex items-center justify-end gap-1 font-semibold text-foreground">
                                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                                        <span>{formatDate(item.resolvedAt)}</span>
                                                                    </div>
                                                                    <div>{formatTime(item.resolvedAt)}</div>
                                                                </div>
                                                            ) : (
                                                                "N/A"
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>

            {/* Reasons details dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <AlertTriangle className="size-5 text-rose-500" />
                            Chi tiết báo cáo
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Danh sách ý kiến báo cáo cho đối tượng: <strong className="text-foreground">"{detailTarget?.name}"</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-3 py-3 border-y my-2 pr-1">
                        {detailsLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-xs text-muted-foreground">Đang tải lý do...</span>
                            </div>
                        ) : details.length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-10">Không tìm thấy chi tiết báo cáo nào</p>
                        ) : (
                            details.map((d) => (
                                <div key={d.id} className="p-3 bg-muted/40 border rounded-lg text-xs space-y-1.5 hover:bg-muted/60 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground flex items-center gap-1">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            {d.user?.name || "N/A"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            (ID: {d.userId})
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-muted-foreground font-mono">{d.user?.email}</p>
                                    <p className="text-foreground leading-relaxed bg-background p-2 rounded-md border text-xs font-medium">
                                        "{d.reason}"
                                    </p>
                                    <div className="flex justify-end items-center text-[10px] text-muted-foreground gap-1 pt-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDateTime(d.createdAt)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <DialogFooter className="mt-2 flex sm:justify-between w-full gap-2">
                        <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>
                            Đóng
                        </Button>
                        {detailTarget && details.length > 0 && (
                            <div className="flex gap-2">
                                {detailTarget.type !== "review" ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 text-xs font-semibold"
                                        onClick={() => handleResolve(detailTarget.type, detailTarget.id, "ban")}
                                        disabled={isResolving}
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-1" /> Khóa
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 text-xs font-semibold"
                                        onClick={() => handleResolve(detailTarget.type, detailTarget.id, "hide")}
                                        disabled={isResolving}
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-1" /> Ẩn bình luận
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                                    onClick={() => handleResolve(detailTarget.type, detailTarget.id, "dismiss")}
                                    disabled={isResolving}
                                >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Bỏ qua
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
