"use client";

import { useShopStatistics } from "@/components/hooks/useShop";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    DollarSign, 
    ShoppingBag, 
    Package, 
    Percent, 
    Calendar, 
    TrendingUp, 
    BarChart3, 
    CheckCircle, 
    XCircle, 
    Truck, 
    Clock, 
    AlertCircle,
    HelpCircle
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid 
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig
} from "@/components/ui/chart";

const chartConfig = {
    revenue: {
        label: "Doanh thu",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

// Helpers for dates
const getPastDateString = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split("T")[0];
};

const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
};

export default function SellerStatisticsPage() {
    // Range states: default to last 30 days
    const [startDate, setStartDate] = useState<string>(getPastDateString(30));
    const [endDate, setEndDate] = useState<string>(getTodayString());
    const [filterType, setFilterType] = useState<"7" | "30" | "custom">("30");

    // Fetch statistics
    const { data: statsRes, isLoading, error } = useShopStatistics(startDate, endDate);

    const stats = statsRes || null;

    // Fast status label mapper
    const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: "Chờ xử lý", color: "bg-amber-500", icon: Clock },
        confirmed: { label: "Đã xác nhận", color: "bg-blue-500", icon: CheckCircle },
        shipping: { label: "Đang giao", color: "bg-indigo-500", icon: Truck },
        delivered: { label: "Thành công", color: "bg-emerald-500", icon: CheckCircle },
        cancelled: { label: "Đã hủy", color: "bg-rose-500", icon: XCircle },
        returned: { label: "Trả hàng", color: "bg-purple-500", icon: AlertCircle },
    };

    // Calculate completions & success rate
    const completionRate = useMemo(() => {
        if (!stats?.summary) return 0;
        const total = stats.summary.totalOrders || 0;
        const success = stats.summary.statusCounts?.delivered || 0;
        return total > 0 ? (success / total) * 100 : 0;
    }, [stats]);

    // Handle Quick filters
    const handleQuickFilter = (days: "7" | "30") => {
        setFilterType(days);
        setStartDate(getPastDateString(parseInt(days)));
        setEndDate(getTodayString());
    };

    const handleCustomFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFilterType("custom");
    };

    // Format money
    const formatVND = (value: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
    };

    // Short format money for chart axes
    const formatShortVND = (value: number) => {
        if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}Tr`;
        if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
        return `${value}`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground font-medium">Đang tải báo cáo thống kê...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 border border-dashed rounded-xl bg-muted/20 m-4">
                <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                <h3 className="text-lg font-semibold">Không thể tải thống kê</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">Vui lòng kiểm tra lại kết nối hoặc đảm bảo tài khoản của bạn đã được thiết lập cửa hàng.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header section with Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Báo cáo & Thống kê
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Theo dõi doanh thu, hiệu suất đơn hàng và sản phẩm bán chạy nhất của cửa hàng bạn.
                    </p>
                </div>
                
                {/* Filters block */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-muted p-1 rounded-lg flex items-center shadow-xs border">
                        <button
                            onClick={() => handleQuickFilter("7")}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                filterType === "7" 
                                    ? "bg-background text-foreground shadow-xs" 
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            7 ngày qua
                        </button>
                        <button
                            onClick={() => handleQuickFilter("30")}
                            className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                                filterType === "30" 
                                    ? "bg-background text-foreground shadow-xs" 
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            30 ngày qua
                        </button>
                    </div>

                    <form onSubmit={handleCustomFilterSubmit} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setFilterType("custom");
                                }}
                                max={endDate}
                                className="w-[140px] text-sm h-9"
                            />
                            <span className="text-muted-foreground text-sm">đến</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setFilterType("custom");
                                }}
                                min={startDate}
                                max={getTodayString()}
                                className="w-[140px] text-sm h-9"
                            />
                        </div>
                    </form>
                </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Revenue Card */}
                <Card className="hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Doanh thu thực tế</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatVND(stats.summary.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Đã hoàn thành bàn giao</p>
                    </CardContent>
                </Card>

                {/* Orders Card */}
                <Card className="hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tổng đơn hàng</CardTitle>
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.summary.totalOrders} <span className="text-sm font-normal text-muted-foreground">đơn</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Toàn bộ trạng thái đơn hàng</p>
                    </CardContent>
                </Card>

                {/* Products Card */}
                <Card className="hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Sản phẩm hiện có</CardTitle>
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.summary.totalProducts} <span className="text-sm font-normal text-muted-foreground">mẫu</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tổng sản phẩm đăng bán</p>
                    </CardContent>
                </Card>

                {/* Completion Rate Card */}
                <Card className="hover:-translate-y-0.5 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Tỷ lệ thành công</CardTitle>
                        <Percent className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {completionRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Đơn giao thành công / Tổng đơn</p>
                    </CardContent>
                </Card>
            </div>

            {/* Middle Section: Chart & Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SVG Revenue Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-muted-foreground" /> Doanh thu theo ngày
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 relative">
                        {stats.chartData && stats.chartData.length > 0 ? (
                            <div className="w-full">
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <AreaChart
                                        data={stats.chartData}
                                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => value.substring(5)} // MM-DD
                                            className="fill-muted-foreground text-xs font-medium"
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => formatShortVND(value)}
                                            className="fill-muted-foreground text-xs font-medium"
                                        />
                                        <ChartTooltip
                                            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                                            content={
                                                <ChartTooltipContent
                                                    hideLabel={false}
                                                    labelFormatter={(value) => {
                                                        return new Date(value).toLocaleDateString("vi-VN", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric"
                                                        });
                                                    }}
                                                    formatter={(value, name, item) => (
                                                        <div className="flex flex-col gap-1 text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-muted-foreground">Doanh thu:</span>
                                                                <span className="font-extrabold text-foreground">
                                                                    {formatVND(Number(value))}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-muted-foreground">Đơn hàng:</span>
                                                                <span className="font-bold text-foreground">
                                                                    {item.payload.orderCount} đơn
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            }
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="var(--color-revenue)"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground text-sm">
                                <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                                Không có dữ liệu doanh thu trong khoảng thời gian này.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status distribution list */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-bold flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" /> Trạng thái đơn hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-1">
                        {stats.summary.totalOrders > 0 ? (
                            Object.entries(stats.summary.statusCounts).map(([statusKey, count]) => {
                                const details = statusLabels[statusKey] || { label: statusKey, color: "bg-muted-foreground", icon: HelpCircle };
                                const StatusIcon = details.icon;
                                const percentage = stats.summary.totalOrders > 0 
                                    ? ((count as number) / stats.summary.totalOrders) * 100 
                                    : 0;

                                return (
                                    <div key={statusKey} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm font-semibold">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="p-1.5 rounded bg-muted text-muted-foreground">
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <span>{details.label}</span>
                                            </div>
                                            <div className="text-foreground">
                                                {count as number} <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${details.color} transition-all duration-500`} 
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[230px] text-muted-foreground text-sm">
                                <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                                Chưa có đơn hàng nào được ghi nhận.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Selling Products */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" /> Top 5 sản phẩm bán chạy nhất
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {stats.topProducts && stats.topProducts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] font-bold text-center">#</TableHead>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className="text-center">Đã bán (SL)</TableHead>
                                    <TableHead className="text-right">Tổng doanh thu</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.topProducts.map((prod: any, idx: number) => (
                                    <TableRow key={prod.id}>
                                        <TableCell className="font-bold text-center">{idx + 1}</TableCell>
                                        <TableCell className="flex items-center gap-3 py-3 min-w-[280px]">
                                            <div className="w-10 h-10 rounded-lg border relative bg-muted overflow-hidden flex-shrink-0">
                                                {prod.image ? (
                                                    <Image 
                                                        src={prod.image} 
                                                        alt={prod.name} 
                                                        fill 
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-semibold text-foreground line-clamp-2">{prod.name}</span>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{prod.quantity}</TableCell>
                                        <TableCell className="text-right font-extrabold text-primary">{formatVND(prod.revenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
                            <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                            Chưa có sản phẩm nào được giao thành công.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
