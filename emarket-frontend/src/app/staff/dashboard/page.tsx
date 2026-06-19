"use client";

import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { orderService } from "@/services/order.service";
import { reportService } from "@/services/report.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    ShieldCheck,
    Undo2,
    ShieldAlert,
    ArrowRight,
    CheckCircle2,
    XCircle,
    MessageSquare,
    AlertCircle,
    Activity,
    ChevronRight,
    Loader2,
    Store
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/lib/date";

export default function StaffDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        verifications: { pending: 0, approved: 0, rejected: 0, total: 0 },
        returns: { pending: 0, approved: 0, rejected: 0, total: 0 },
        reports: { pending: 0, resolved: 0, total: 0 }
    });

    const [recentPendingItems, setRecentPendingItems] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [verifRes, returnRes, reportRes, historyRes] = await Promise.all([
                shopService.getVerifications(),
                orderService.getReturnRequests(),
                reportService.getStats(),
                reportService.getHistory()
            ]);

            // 1. Process Verifications
            const verifs = verifRes.data || verifRes || [];
            const vPending = verifs.filter((v: any) => v.status === "pending");
            const vApproved = verifs.filter((v: any) => v.status === "approved").length;
            const vRejected = verifs.filter((v: any) => v.status === "rejected").length;

            // 2. Process Returns
            const rets = returnRes.data || returnRes || [];
            const rPending = rets.filter((r: any) => r.status === "PENDING");
            const rApproved = rets.filter((r: any) => r.status === "APPROVED").length;
            const rRejected = rets.filter((r: any) => r.status === "REJECTED").length;

            // 3. Process Reports
            const repStats = reportRes.data || reportRes || {};
            const pRepCount = (repStats.reportedProducts || []).reduce((acc: number, item: any) => acc + (item.reportCount || 0), 0);
            const rRepCount = (repStats.reportedReviews || []).reduce((acc: number, item: any) => acc + (item.reportCount || 0), 0);
            const sRepCount = (repStats.reportedShops || []).reduce((acc: number, item: any) => acc + (item.reportCount || 0), 0);
            const totalPendingReports = pRepCount + rRepCount + sRepCount;

            const repHistory = historyRes.data || historyRes || [];
            const totalResolvedReports = repHistory.length;

            setStats({
                verifications: {
                    pending: vPending.length,
                    approved: vApproved,
                    rejected: vRejected,
                    total: verifs.length
                },
                returns: {
                    pending: rPending.length,
                    approved: rApproved,
                    rejected: rRejected,
                    total: rets.length
                },
                reports: {
                    pending: totalPendingReports,
                    resolved: totalResolvedReports,
                    total: totalPendingReports + totalResolvedReports
                }
            });

            // Consolidate recent pending items
            const items: any[] = [];

            vPending.slice(0, 3).forEach((v: any) => {
                items.push({
                    id: `v-${v.id}`,
                    type: "Xác thực Shop",
                    title: `Shop "${v.shop?.name || "N/A"}" yêu cầu xác thực`,
                    date: v.createdAt,
                    link: "/staff/dashboard/verifications",
                    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30"
                });
            });

            rPending.slice(0, 3).forEach((r: any) => {
                items.push({
                    id: `r-${r.id}`,
                    type: "Hoàn hàng",
                    title: `Đơn hàng #${r.orderId} yêu cầu hoàn tiền`,
                    date: r.createdAt,
                    link: "/staff/dashboard/returns-manager",
                    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
                });
            });

            // Group reported entities as pending alert items
            (repStats.reportedProducts || []).slice(0, 2).forEach((p: any) => {
                items.push({
                    id: `rep-p-${p.productId}`,
                    type: "Báo cáo sản phẩm",
                    title: `Sản phẩm "${p.productName}" bị báo cáo ${p.reportCount} lần`,
                    date: new Date().toISOString(), // No individual date for grouped reports
                    link: "/staff/dashboard/reports-manager",
                    color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                });
            });

            // Sort by date (if available)
            items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setRecentPendingItems(items.slice(0, 5));

        } catch (error: any) {
            console.error(error);
            toast.error("Không thể tải thông tin thống kê dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải số liệu thống kê...</p>
            </div>
        );
    }

    const totalPending = stats.verifications.pending + stats.returns.pending + (stats.reports.pending > 0 ? 1 : 0);

    return (
        <div className="space-y-6 py-4">
            {/* Welcome Banner
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Chào mừng trở lại, Nhân viên hỗ trợ!</h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Hệ thống hiện có <span className="text-amber-400 font-semibold">{totalPending} danh mục</span> có yêu cầu chờ xử lý. Hãy kiểm tra các mục dưới đây.
                    </p>
                </div>
                <div className="bg-white/10 dark:bg-black/20 px-4 py-2 rounded-lg text-sm border border-white/5">
                    Hôm nay: <span className="font-semibold">{formatDate(new Date())}</span>
                </div>
            </div> */}

            {/* Quick Overview Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Shop Verifications Overview */}
                <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold">Xác thực cửa hàng</CardTitle>
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold">{stats.verifications.pending}</span>
                                <span className="text-xs text-muted-foreground ml-2">chờ duyệt</span>
                            </div>
                            <Link href="/staff/dashboard/verifications">
                                <Button size="sm" variant="ghost" className="gap-1.5 pr-1 text-blue-600 dark:text-blue-400 hover:text-blue-700">
                                    Xử lý <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs border-t pt-2.5 text-muted-foreground">
                            <span>Đã duyệt: {stats.verifications.approved}</span>
                            <span>Từ chối: {stats.verifications.rejected}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Returns/Refunds Overview */}
                <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold">Trả hàng & Hoàn tiền</CardTitle>
                        <Undo2 className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold">{stats.returns.pending}</span>
                                <span className="text-xs text-muted-foreground ml-2">yêu cầu mới</span>
                            </div>
                            <Link href="/staff/dashboard/returns-manager">
                                <Button size="sm" variant="ghost" className="gap-1.5 pr-1 text-amber-600 dark:text-amber-400 hover:text-amber-700">
                                    Xử lý <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs border-t pt-2.5 text-muted-foreground">
                            <span>Đồng ý: {stats.returns.approved}</span>
                            <span>Từ chối: {stats.returns.rejected}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Reports Overview */}
                <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold">Báo cáo vi phạm</CardTitle>
                        <ShieldAlert className="h-5 w-5 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-3xl font-bold">{stats.reports.pending}</span>
                                <span className="text-xs text-muted-foreground ml-2">báo cáo vi phạm</span>
                            </div>
                            <Link href="/staff/dashboard/reports-manager">
                                <Button size="sm" variant="ghost" className="gap-1.5 pr-1 text-rose-600 dark:text-rose-400 hover:text-rose-700">
                                    Xử lý <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs border-t pt-2.5 text-muted-foreground">
                            <span>Đã giải quyết/Từ chối: {stats.reports.resolved}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split layout for recent tasks & status breakdown */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Recent Pending Feed */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-3 border-b">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                                    Yêu cầu chờ xử lý gần đây
                                </CardTitle>
                                <CardDescription>Các hồ sơ và báo cáo cần phê duyệt sớm nhất</CardDescription>
                            </div>
                            <Badge variant="outline" className="font-semibold text-xs">
                                {recentPendingItems.length} yêu cầu
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentPendingItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2 opacity-60" />
                                <p className="font-semibold text-sm">Tuyệt vời! Không còn yêu cầu tồn đọng</p>
                                <p className="text-xs mt-0.5">Tất cả hồ sơ xác thực và yêu cầu hoàn tiền đã được xử lý.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentPendingItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <Badge className={`mt-0.5 text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 shrink-0`}>
                                                {item.type}
                                            </Badge>
                                            <div>
                                                <p className="text-sm font-medium leading-relaxed">{item.title}</p>
                                                {item.date && (
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        Thời gian: {formatDate(item.date)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Link href={item.link}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground">
                                                <ChevronRight size={18} />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick actions & links */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Lối tắt nghiệp vụ</CardTitle>
                            <CardDescription>Truy cập nhanh các chức năng hỗ trợ khác</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link href="/staff/dashboard/chat-support">
                                <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2 border-slate-200">
                                    <MessageSquare size={16} className="text-indigo-500" />
                                    <span>Chat hỗ trợ khách hàng</span>
                                </Button>
                            </Link>
                            <Link href="/staff/dashboard/reviews-manager">
                                <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2 border-slate-200">
                                    <MessageSquare size={16} className="text-teal-500" />
                                    <span>Quản lý đánh giá sản phẩm</span>
                                </Button>
                            </Link>
                            <Link href="/staff/dashboard/shop-manager">
                                <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2 border-slate-200">
                                    <Store size={16} className="text-purple-500" />
                                    <span>Quản lý danh sách cửa hàng</span>
                                </Button>
                            </Link>
                            <Link href="/staff/dashboard/products-manager">
                                <Button variant="outline" className="w-full justify-start text-xs h-10 gap-2 border-slate-200">
                                    <ShieldAlert size={16} className="text-rose-500" />
                                    <span>Quản lý sản phẩm hệ thống</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-primary" />
                                Hướng dẫn vận hành
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                            <p>
                                🏪 **Hồ sơ Shop**: Cần kiểm duyệt kỹ ảnh giấy phép kinh doanh, thông tin liên hệ và tính chính xác của địa chỉ trước khi Duyệt.
                            </p>
                            <p>
                                💸 **Hoàn tiền/Trả hàng**: Đơn hàng thanh toán Momo sẽ được tự động hoàn tiền qua cổng sandbox khi yêu cầu được duyệt.
                            </p>
                            <p>
                                🚫 **Báo cáo vi phạm**: Vô hiệu hóa hoặc khóa tạm thời các sản phẩm, tài khoản có hành vi gian lận hoặc vi phạm thuần phong mỹ tục.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}