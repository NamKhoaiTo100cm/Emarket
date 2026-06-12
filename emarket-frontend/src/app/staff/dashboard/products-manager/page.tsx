"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { 
    Eye, 
    Store, 
    Trash2, 
    Search, 
    Filter, 
    Package, 
    CheckCircle2, 
    AlertTriangle, 
    Ban, 
    XCircle,
    Calendar,
    Loader2,
    Tag
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { PaginationLayout } from "@/components/layout/PaginationLayout";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import Image from "next/image";

export default function ProductsManagerPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCounting, setIsCounting] = useState(true);

    const [pagination, setPagination] = useState<any>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    const [counts, setCounts] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        banned: 0,
    });

    // Filtering states
    const [localKeyword, setLocalKeyword] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Deletion modal states
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<any | null>(null);

    // Debounce keyword search
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchKeyword(localKeyword);
            setPagination((prev: any) => ({ ...prev, page: 1 }));
        }, 500);
        return () => clearTimeout(handler);
    }, [localKeyword]);

    const fetchCounts = async () => {
        setIsCounting(true);
        try {
            const [totalRes, activeRes, inactiveRes, bannedRes] = await Promise.all([
                productService.getAll(1, 1),
                productService.getAll(1, 1, "", 0, "", undefined, undefined, "active"),
                productService.getAll(1, 1, "", 0, "", undefined, undefined, "inactive"),
                productService.getAll(1, 1, "", 0, "", undefined, undefined, "banned"),
            ]);
            setCounts({
                total: totalRes.pagination.totalCount || 0,
                active: activeRes.pagination.totalCount || 0,
                inactive: inactiveRes.pagination.totalCount || 0,
                banned: bannedRes.pagination.totalCount || 0,
            });
        } catch (error) {
            console.error("Lỗi tải thống kê sản phẩm:", error);
        } finally {
            setIsCounting(false);
        }
    };

    const fetchProducts = () => {
        setIsLoading(true);
        const actualStatus = statusFilter === "all" ? undefined : statusFilter;
        productService.getAll(pagination.page, pagination.limit, searchKeyword, 0, "", undefined, undefined, actualStatus)
            .then((res) => {
                setProducts(res.data || []);
                setPagination((prev: any) => ({
                    ...prev,
                    total: res.pagination.totalCount || 0,
                    totalPages: Math.ceil((res.pagination.totalCount || 0) / prev.limit)
                }));
            })
            .catch((err) => {
                toast.error("Không thể tải danh sách sản phẩm: " + err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchProducts();
    }, [pagination.page, pagination.limit, searchKeyword, statusFilter]);

    useEffect(() => {
        fetchCounts();
    }, []);

    const handleStatusChange = (product: any, newStatus: string) => {
        productService.toggleBanProduct(product.id)
            .then(() => {
                toast.success(`Cập nhật trạng thái thành công cho sản phẩm "${product.name}"`);
                setProducts((prev: any[]) => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
                fetchCounts();
            })
            .catch((err) => {
                toast.error("Cập nhật thất bại: " + err.message);
            });
    };

    const handleDeleteProduct = () => {
        if (!productToDelete) return;
        productService.delete(productToDelete.id)
            .then(() => {
                toast.success(`Đã xóa thành công sản phẩm "${productToDelete.name}"`);
                setIsDeleteOpen(false);
                setProductToDelete(null);
                fetchProducts();
                fetchCounts();
            })
            .catch((err) => {
                toast.error("Xóa thất bại: " + err.message);
            });
    };

    return (
        <div className="space-y-6 p-1">
            {/* Header Area */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                <p className="text-muted-foreground mt-1">
                    Duyệt danh sách sản phẩm, kiểm soát trạng thái bán hàng, chặn hoặc xóa sản phẩm vi phạm.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card className="border-l-4 border-l-primary/70 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tổng sản phẩm</p>
                            <h3 className="text-2xl font-bold">
                                {isCounting ? <Loader2 className="h-5 w-5 animate-spin" /> : counts.total}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
                            <h3 className="text-2xl font-bold">
                                {isCounting ? <Loader2 className="h-5 w-5 animate-spin" /> : counts.active}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-amber-500/10 p-3 text-amber-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ngừng bán</p>
                            <h3 className="text-2xl font-bold">
                                {isCounting ? <Loader2 className="h-5 w-5 animate-spin" /> : counts.inactive}
                            </h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive/70 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                            <Ban className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Đã chặn (Banned)</p>
                            <h3 className="text-2xl font-bold">
                                {isCounting ? <Loader2 className="h-5 w-5 animate-spin" /> : counts.banned}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Action Card */}
            <Card className="shadow-xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Danh sách sản phẩm hệ thống</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 max-w-md w-full relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên sản phẩm..."
                                value={localKeyword}
                                onChange={(e) => setLocalKeyword(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => {
                                    setStatusFilter(val);
                                    setPagination((prev: any) => ({ ...prev, page: 1 }));
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Đang hoạt động</SelectItem>
                                    <SelectItem value="inactive">Ngừng bán</SelectItem>
                                    <SelectItem value="banned">Bị chặn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Sản phẩm</TableHead>
                                    <TableHead>Cửa hàng</TableHead>
                                    <TableHead>Thông tin giá</TableHead>
                                    <TableHead>Tồn kho</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="w-[160px]">Trạng thái</TableHead>
                                    <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-28 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>Đang tải danh sách sản phẩm...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : products.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                                            Không tìm thấy sản phẩm nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-muted/40">
                                            {/* Product Info */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-muted">
                                                        <Image
                                                            src={product.images && product.images[0] ? product.images[0].imageUrl : "/vercel.svg"}
                                                            alt={product.name}
                                                            fill
                                                            sizes="48px"
                                                            className="object-contain p-1"
                                                        />
                                                    </div>
                                                    <div className="max-w-[220px] overflow-hidden">
                                                        <div className="font-semibold text-foreground truncate" title={product.name}>
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                            <Tag className="h-3 w-3" />
                                                            <span>Mã: #{product.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Shop Info */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                    <Store className="h-3.5 w-3.5 text-primary/75" />
                                                    <span className="truncate max-w-[120px]" title={product.shop?.name || `Shop #${product.shopId}`}>
                                                        {product.shop?.name || `Shop #${product.shopId}`}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Price Info */}
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="text-xs text-muted-foreground line-through">
                                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                                                    </div>
                                                    <div className="font-semibold text-primary text-sm">
                                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.salePrice || product.price)}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Stock Info */}
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    product.stock === 0
                                                        ? "bg-destructive/10 text-destructive"
                                                        : product.stock < 10
                                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500"
                                                        : "bg-muted text-muted-foreground"
                                                }`}>
                                                    {product.stock === 0 ? "Hết hàng" : `${product.stock} sản phẩm`}
                                                </span>
                                            </TableCell>

                                            {/* Date Created */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    <span>{new Date(product.createdAt).toLocaleDateString("vi-VN")}</span>
                                                </div>
                                            </TableCell>

                                            {/* Status Selector */}
                                            <TableCell>
                                                <Select
                                                    value={product.status}
                                                    onValueChange={(val) => handleStatusChange(product, val)}
                                                >
                                                    <SelectTrigger className="w-[140px] h-8 text-xs font-medium">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {product.status === 'banned' ? (
                                                            <>
                                                                <SelectItem value="banned" disabled className="text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="h-2 w-2 rounded-full bg-destructive" />
                                                                        <span>Bị chặn (Banned)</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="inactive" className="text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                                        <span>Bỏ chặn (Ngừng bán)</span>
                                                                    </div>
                                                                </SelectItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {product.status === 'active' ? (
                                                                    <SelectItem value="active" disabled className="text-xs">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                            <span>Đang hoạt động</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ) : (
                                                                    <SelectItem value="inactive" disabled className="text-xs">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                                            <span>Ngừng bán</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                )}
                                                                <SelectItem value="banned" className="text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="h-2 w-2 rounded-full bg-destructive" />
                                                                        <span>Bị chặn (Banned)</span>
                                                                    </div>
                                                                </SelectItem>
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() => window.open(`/product-detail/${product.id}`, "_blank")}
                                                        title="Xem chi tiết sản phẩm"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            setProductToDelete(product);
                                                            setIsDeleteOpen(true);
                                                        }}
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {/* Footer Area with Pagination */}
                {products.length > 0 && (
                    <CardFooter className="py-4 border-t bg-muted/20">
                        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
                            <span className="text-xs text-muted-foreground">
                                Hiển thị từ 1 - {products.length} trong tổng số {pagination.total} sản phẩm
                            </span>
                            <PaginationLayout
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => setPagination((prev: any) => ({ ...prev, page }))}
                            />
                        </div>
                    </CardFooter>
                )}
            </Card>

            {/* Confirm Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                            <XCircle className="h-5 w-5" />
                            Xác nhận xóa sản phẩm
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-foreground">
                            Hành động này <strong className="text-destructive">không thể hoàn tác</strong>. 
                            Bạn có chắc muốn xóa vĩnh viễn sản phẩm <strong>{productToDelete?.name}</strong> (Mã sản phẩm #{productToDelete?.id}) ra khỏi hệ thống Emarket?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Hủy bỏ</Button>
                        </DialogClose>
                        <Button 
                            type="button" 
                            variant="destructive"
                            onClick={handleDeleteProduct}
                        >
                            Xác nhận xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}