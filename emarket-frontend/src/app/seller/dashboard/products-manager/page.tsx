"use client"
import { useMe } from "@/components/hooks/useAuth";
import { useMyShop } from "@/components/hooks/useShop";
import { PaginationLayout } from "@/components/layout/PaginationLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productService } from "@/services/product.service"
import { ChevronDown, ChevronRight, InfoIcon, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ProductManager = () => {
    const { data: resUser } = useMe();
    const { data: resShop } = useMyShop(resUser?.data?.id, !!resUser?.data?.id);
    const myShop = resShop?.data;
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 8,
        totalItems: 0,
        totalPages: 0,
    });

    const getProducts = async () => {
        const res = await productService.findByShopId(Number(myShop?.id), pagination.page, pagination.pageSize);
        setProducts(res.data ?? []);
        setPagination((prev) => ({
            ...prev,
            totalItems: res.pagination.totalCount,
            totalPages: Math.ceil(res.pagination.totalCount / pagination.pageSize),
        }));
    };

    useEffect(() => {
        if (myShop?.id) {
            getProducts();
        }
    }, [myShop?.id, pagination.page]);

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        const res = await productService.delete(id);
        if (res) {
            toast.success("Xóa sản phẩm thành công");
            getProducts();
        }
    };

    const handleToggleStatus = async (item: any) => {
        await productService.toggleSellingProduct(item.id);
        toast.success(item.status === "active" ? "Đã ngừng bán sản phẩm" : "Đã kích hoạt sản phẩm");
        getProducts();
    };

    const toggleExpand = (id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Quản Lý Sản Phẩm
                    <span className="ml-2 text-base font-normal text-muted-foreground">({pagination.totalItems} sản phẩm)</span>
                </h1>
                <Button onClick={() => router.push("/seller/dashboard/add-product")}>
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm sản phẩm
                </Button>
            </div>

            <Alert variant="default" className="mb-4">
                <InfoIcon />
                <AlertTitle>Hướng dẫn</AlertTitle>
                <AlertDescription>
                    Bấm vào mũi tên ▶ để xem các loại sản phẩm (variants). Bạn có thể thêm/sửa loại trong trang chỉnh sửa sản phẩm.
                </AlertDescription>
            </Alert>

            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-8" />
                            <TableHead className="w-16">Ảnh</TableHead>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead className="text-right">Giá gốc</TableHead>
                            <TableHead className="text-center">Tồn kho</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length > 0 ? products.map((item: any) => {
                            const hasVariants = item.variants && item.variants.length > 0;
                            const isExpanded = expandedIds.has(item.id);

                            return (
                                <>
                                    {/* Product row */}
                                    <TableRow key={item.id} className="hover:bg-muted/30">
                                        {/* Expand toggle */}
                                        <TableCell className="px-2">
                                            {hasVariants ? (
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="p-1 rounded hover:bg-muted transition-colors"
                                                    title={isExpanded ? "Thu gọn" : "Xem loại sản phẩm"}
                                                >
                                                    {isExpanded
                                                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                    }
                                                </button>
                                            ) : null}
                                        </TableCell>

                                        {/* Image */}
                                        <TableCell>
                                            <Image
                                                src={item.images?.[0]?.imageUrl || "/iphone-17-pro-max.webp"}
                                                width={56}
                                                height={56}
                                                alt={item.name}
                                                className="h-14 w-14 rounded-md object-cover border"
                                            />
                                        </TableCell>

                                        {/* Name */}
                                        <TableCell>
                                            <p className="font-medium line-clamp-2 max-w-[260px]">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">#{item.id}</span>
                                                {hasVariants && (
                                                    <Badge variant="outline" className="text-xs h-5 px-1.5">
                                                        {item.variants.length} loại
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Price */}
                                        <TableCell className="text-right font-medium">
                                            <p>{Number(item.price).toLocaleString("vi-VN")}đ</p>
                                            {item.salePrice > 0 && (
                                                <p className="text-xs text-muted-foreground line-through">
                                                    {Number(item.salePrice).toLocaleString("vi-VN")}đ
                                                </p>
                                            )}
                                        </TableCell>

                                        {/* Stock */}
                                        <TableCell className="text-center">
                                            {hasVariants ? (
                                                <span className="text-xs text-muted-foreground italic">Theo loại</span>
                                            ) : item.stock > 0 ? (
                                                <span className="text-sm font-medium">{item.stock}</span>
                                            ) : (
                                                <Badge variant="destructive" className="text-xs">Hết hàng</Badge>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="text-center">
                                            {item.status === "banned" ? (
                                                <Badge variant="destructive">Bị cấm</Badge>
                                            ) : (
                                                <Select value={item.status} onValueChange={() => handleToggleStatus(item)}>
                                                    <SelectTrigger className="w-32 mx-auto">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">Đang bán</SelectItem>
                                                        <SelectItem value="inactive">Ngừng bán</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    title="Chỉnh sửa"
                                                    onClick={() => router.push(`/seller/dashboard/edit-product/${item.id}`)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title="Xóa"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteProduct(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Variant rows (expandable) */}
                                    {hasVariants && isExpanded && item.variants.map((v: any) => (
                                        <TableRow key={`variant-${v.id}`} className="bg-muted/20 border-l-4 border-l-primary/30">
                                            <TableCell />
                                            <TableCell />
                                            <TableCell>
                                                <div className="flex items-center gap-2 pl-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                                                    <span className="text-sm text-muted-foreground">{v.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                <p className="font-medium">{Number(v.price).toLocaleString("vi-VN")}đ</p>
                                                {v.salePrice && (
                                                    <p className="text-xs text-muted-foreground line-through">
                                                        {Number(v.salePrice).toLocaleString("vi-VN")}đ
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center text-sm">
                                                {v.stock > 0
                                                    ? <span>{v.stock}</span>
                                                    : <Badge variant="destructive" className="text-xs">Hết</Badge>
                                                }
                                            </TableCell>
                                            <TableCell />
                                            <TableCell />
                                        </TableRow>
                                    ))}
                                </>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    Chưa có sản phẩm nào. Bấm "Thêm sản phẩm" để bắt đầu.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={7} className="bg-muted/20">
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-sm text-muted-foreground">
                                        Hiển thị {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalItems)}–{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} trong {pagination.totalItems} sản phẩm
                                    </span>
                                    <PaginationLayout
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </div>
    );
};

export default ProductManager;