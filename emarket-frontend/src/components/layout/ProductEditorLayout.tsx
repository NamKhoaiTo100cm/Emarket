import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import FileUploadDropzone1 from "../file-upload-dropzone-1";
import { productService } from "@/services/product.service";
import { ProductVariant } from "@/types/product";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, Check, X, LockIcon } from "lucide-react";
import { useMe } from "../hooks/useAuth";
import { useMyShop } from "../hooks/useShop";
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from "next-themes";
import { formatNumberString, parseFormattedString } from "@/lib/utils";
import { useRouter } from "next/navigation";


interface Props {
    mode: 'add' | 'edit'
    handleAddProduct?: (formData: FormData) => Promise<void>
    handleUpdateProduct?: (formData: FormData) => Promise<void>
    categories: any[]
    product?: any
}
export default function ProductEditorLayout(props: Props) {
    const { mode, handleAddProduct, handleUpdateProduct, categories, product } = props;
    const router = useRouter();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
    const [files, setFiles] = useState<File[]>([]);
    const { data: resUser } = useMe();
    const { data: resShop } = useMyShop(resUser?.data?.id, !!resUser?.data?.id);
    const myShop = resShop?.data;
    const [description, setDescription] = useState<string>(
        product?.description ?? ''
    );
    const { resolvedTheme } = useTheme();

    const [price, setPrice] = useState<string>('');
    const [salePrice, setSalePrice] = useState<string>('');

    // Variant state
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [variantForm, setVariantForm] = useState({ name: '', price: '', salePrice: '', stock: '' });
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ name: '', price: '', salePrice: '', stock: '' });

    useEffect(() => {
        if (product?.categoryId) {
            setSelectedCategoryId(product.categoryId.toString());
        }
        if (product?.variants) {
            setVariants(product.variants);
        }
        if (product?.description) setDescription(product.description); // ← thêm dòng này
        if (product?.price) {
            setPrice(formatNumberString(String(product.price)));
        } else {
            setPrice('');
        }
        if (product?.salePrice) {
            setSalePrice(formatNumberString(String(product.salePrice)));
        } else {
            setSalePrice('');
        }
    }, [product]);

    const handleAddVariant = async () => {
        if (!variantForm.name.trim() || !variantForm.price || !variantForm.stock) {
            toast.error('Vui lòng nhập đầy đủ tên, giá và số lượng');
            return;
        }
        const newVariantData = {
            name: variantForm.name,
            price: Number(parseFormattedString(variantForm.price)),
            salePrice: variantForm.salePrice && parseFormattedString(variantForm.salePrice) !== ''
                ? Number(parseFormattedString(variantForm.salePrice))
                : undefined,
            stock: Number(variantForm.stock),
        };

        if (newVariantData.salePrice !== undefined && newVariantData.salePrice >= newVariantData.price) {
            toast.error('Giá khuyến mại phải nhỏ hơn giá gốc');
            return;
        }

        if (mode === 'add') {
            // Buffer locally — chưa có productId để gọi API
            const tempVariant = { id: Date.now(), productId: 0, sortOrder: 0, ...newVariantData } as any;
            setVariants((prev) => [...prev, tempVariant]);
            setVariantForm({ name: '', price: '', salePrice: '', stock: '' });
            setIsAddingVariant(false);
        } else {
            if (!product?.id) {
                toast.error('Không tìm thấy sản phẩm');
                return;
            }
            const res = await productService.createVariant(product.id, newVariantData);
            if (res.statusCode === 201 || res.data) {
                toast.success('Thêm loại sản phẩm thành công');
                const refreshed = await productService.getVariants(product.id);
                setVariants(refreshed.data ?? []);
                setVariantForm({ name: '', price: '', salePrice: '', stock: '' });
                setIsAddingVariant(false);
            } else {
                toast.error('Thêm loại thất bại', { description: res.message });
            }
        }
    };

    const handleDeleteVariant = async (variantId: number) => {
        if (mode === 'add') {
            setVariants((prev) => prev.filter((v) => v.id !== variantId));
            return;
        }
        const res = await productService.deleteVariant(variantId);
        if (res.statusCode === 200 || res.data || res.message) {
            toast.success('Xóa loại sản phẩm thành công');
            setVariants((prev) => prev.filter((v) => v.id !== variantId));
        } else {
            toast.error('Xóa thất bại', { description: res.message });
        }
    };

    const startEditVariant = (v: ProductVariant) => {
        setEditingVariantId(v.id);
        setEditForm({
            name: v.name,
            price: formatNumberString(String(v.price)),
            salePrice: v.salePrice ? formatNumberString(String(v.salePrice)) : '',
            stock: String(v.stock),
        });
    };

    const handleSaveEditVariant = async (variantId: number) => {
        if (!editForm.name.trim() || !editForm.price || !editForm.stock) {
            toast.error('Vui lòng nhập đầy đủ tên, giá và số lượng');
            return;
        }
        const updated = {
            name: editForm.name,
            price: Number(parseFormattedString(editForm.price)),
            salePrice: editForm.salePrice && parseFormattedString(editForm.salePrice) !== ''
                ? Number(parseFormattedString(editForm.salePrice))
                : undefined,
            stock: Number(editForm.stock),
        };

        if (updated.salePrice !== undefined && updated.salePrice >= updated.price) {
            toast.error('Giá khuyến mại phải nhỏ hơn giá gốc');
            return;
        }

        if (mode === 'add') {
            // Cập nhật local buffer
            setVariants((prev) => prev.map((v) => v.id === variantId ? { ...v, ...updated } : v));
            setEditingVariantId(null);
            return;
        }

        const res = await productService.updateVariant(variantId, updated);
        if (res.statusCode === 200 || res.data) {
            toast.success('Cập nhật loại sản phẩm thành công');
            setVariants((prev) => prev.map((v) => v.id === variantId ? { ...v, ...updated } : v));
            setEditingVariantId(null);
        } else {
            toast.error('Cập nhật thất bại', { description: res.message });
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold">{mode === 'add' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}</h1>
            <form className="grid grid-cols gap-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (files.length > 0) {
                    files.forEach((file) => {
                        formData.append("imageFiles", file)
                    });
                }
                formData.append("categoryId", selectedCategoryId?.toString() || "");
                formData.set('description', description);

                // Strip formatting for product main price and sale price in formData
                const rawPrice = parseFormattedString(formData.get('price') as string || '');
                const rawSalePrice = parseFormattedString(formData.get('salePrice') as string || '');
                formData.set('price', rawPrice);
                if (rawSalePrice) {
                    formData.set('salePrice', rawSalePrice);
                } else {
                    formData.delete('salePrice');
                }

                // Nếu sản phẩm không có loại, kiểm tra giá khuyến mại của chính sản phẩm đó
                if (variants.length === 0) {
                    const priceNum = Number(rawPrice);
                    const salePriceNum = rawSalePrice ? Number(rawSalePrice) : undefined;
                    if (salePriceNum !== undefined && !isNaN(salePriceNum) && salePriceNum >= priceNum) {
                        toast.error('Giá khuyến mại của sản phẩm phải nhỏ hơn giá gốc');
                        return;
                    }
                }

                // Khi có variants, check xem giá khuyến mại của từng loại có nhỏ hơn giá gốc không
                if (variants.length > 0) {
                    for (const v of variants) {
                        const price = Number(v.price);
                        const salePrice = v.salePrice !== undefined && v.salePrice !== null ? Number(v.salePrice) : undefined;
                        if (salePrice !== undefined && !isNaN(salePrice) && salePrice >= price) {
                            toast.error(`Giá khuyến mại của loại "${v.name}" phải nhỏ hơn giá gốc`);
                            return;
                        }
                    }
                }

                // Khi có variants, stock của product không dùng — set = 0 để pass validation
                if (variants.length > 0) {
                    formData.set('stock', '0');
                }

                if (mode === 'add') {
                    // Nhúng pending variants vào FormData để parent xử lý sau khi tạo product
                    if (variants.length > 0) {
                        formData.append('_pendingVariants', JSON.stringify(
                            variants.map(v => ({ name: v.name, price: v.price, salePrice: v.salePrice, stock: v.stock }))
                        ));
                    }
                    handleAddProduct?.(formData);
                } else {
                    handleUpdateProduct?.(formData);
                }
            }}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="text-sm">Tên sản phẩm</Label>
                    <Input id="name" name="name" defaultValue={product?.name} placeholder="Tên sản phẩm" required />
                </div>

                <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="category" className="text-sm">Danh mục {myShop?.isVerified ? "" : "(Không thể chọn một số danh mục nếu chưa xác thực shop) "}</Label>
                        <Select value={selectedCategoryId}
                            onValueChange={(value) => {
                                setSelectedCategoryId(value)
                            }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Danh mục" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category: any) => (
                                    <SelectItem disabled={category.requiresVerification == true && myShop?.isVerified == false} key={category.id} value={category.id.toString()}>{category.icon}{" "}{category.name}{" "}{product?.categoryId == category.id ? "(Chọn)" : " "} {category.requiresVerification == true && myShop?.isVerified == false ? <LockIcon className="size-4" /> : ""}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="price" className="text-sm">Giá sản phẩm</Label>
                        <Input 
                            id="price" 
                            name="price" 
                            value={price} 
                            onChange={(e) => setPrice(formatNumberString(e.target.value))} 
                            placeholder="Giá sản phẩm" 
                            required 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="salePrice" className="text-sm">Giá khuyến mại</Label>
                        <Input 
                            id="salePrice" 
                            name="salePrice" 
                            value={salePrice} 
                            onChange={(e) => setSalePrice(formatNumberString(e.target.value))} 
                            placeholder="Giá khuyến mại" 
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="stock" className="text-sm">
                            Số lượng tồn kho
                        </Label>
                        {variants.length > 0 ? (
                            <div className="flex items-center h-9 px-3 rounded-md border bg-muted/50 text-sm text-muted-foreground">
                                Tự động tính theo từng loại sản phẩm
                            </div>
                        ) : (
                            <Input id="stock" name="stock" type="number" defaultValue={product?.stock} placeholder="Số lượng tồn kho" required />
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="image" className="text-sm">Hình ảnh</Label>
                    <FileUploadDropzone1 fileType="image" onFilesChange={setFiles} images={product?.images || []} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="description" className="text-sm">Mô tả</Label>
                    {/* <Textarea id="description" name="description" defaultValue={product?.description} placeholder="Mô tả" required /> */}
                    <div data-color-mode={resolvedTheme}> {/* hoặc "dark" theo theme */}
                        <MDEditor
                            value={description}
                            onChange={(val) => setDescription(val || '')}
                            height={200}
                            preview="edit" // "edit" | "preview" | "live"
                        />
                    </div>
                </div>
                {/* ===== Variant Management ===== */}
                <div className="mt-8 border rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Loại sản phẩm</h2>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setIsAddingVariant((v) => !v)}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Thêm loại
                        </Button>
                    </div>

                    {/* Form thêm variant */}
                    {isAddingVariant && (
                        <div className="border rounded-md p-3 bg-muted/40 flex flex-col gap-2">
                            <p className="text-sm font-medium">Thêm loại mới</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Tên loại *</Label>
                                    <Input
                                        placeholder="vd: Đỏ / L"
                                        value={variantForm.name}
                                        onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Giá *</Label>
                                    <Input
                                        placeholder="Giá"
                                        value={variantForm.price}
                                        onChange={(e) => setVariantForm((f) => ({ ...f, price: formatNumberString(e.target.value) }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Giá KM</Label>
                                    <Input
                                        placeholder="Giá khuyến mại"
                                        value={variantForm.salePrice}
                                        onChange={(e) => setVariantForm((f) => ({ ...f, salePrice: formatNumberString(e.target.value) }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs">Tồn kho *</Label>
                                    <Input
                                        type="number"
                                        placeholder="Số lượng"
                                        value={variantForm.stock}
                                        onChange={(e) => setVariantForm((f) => ({ ...f, stock: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <Button type="button" size="sm" onClick={handleAddVariant}>Lưu loại</Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setIsAddingVariant(false)}>Hủy</Button>
                            </div>
                        </div>
                    )}

                    {/* Danh sách variants */}
                    {variants.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">Sản phẩm này chưa có loại nào. Bấm "Thêm loại" để bắt đầu.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {variants.map((v) => {
                                const isEditing = editingVariantId === v.id;
                                return (
                                    <div key={v.id} className="border rounded-md bg-background overflow-hidden">
                                        {isEditing ? (
                                            /* ── EDIT FORM ── */
                                            <div className="p-3 flex flex-col gap-2">
                                                <p className="text-xs font-medium text-muted-foreground">Đang sửa: <span className="text-foreground">{v.name}</span></p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs">Tên loại *</Label>
                                                        <Input
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs">Giá *</Label>
                                                        <Input
                                                            value={editForm.price}
                                                            onChange={(e) => setEditForm((f) => ({ ...f, price: formatNumberString(e.target.value) }))}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs">Giá KM</Label>
                                                        <Input
                                                            placeholder="(không bắt buộc)"
                                                            value={editForm.salePrice}
                                                            onChange={(e) => setEditForm((f) => ({ ...f, salePrice: formatNumberString(e.target.value) }))}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <Label className="text-xs">Tồn kho *</Label>
                                                        <Input
                                                            type="number"
                                                            value={editForm.stock}
                                                            onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button type="button" size="sm" onClick={() => handleSaveEditVariant(v.id)}>
                                                        <Check className="w-3.5 h-3.5 mr-1" />Lưu
                                                    </Button>
                                                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditingVariantId(null)}>
                                                        <X className="w-3.5 h-3.5 mr-1" />Hủy
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── VIEW ROW ── */
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                                    <span className="font-medium">{v.name}</span>
                                                    <span className="text-muted-foreground">Giá: <span className="text-foreground font-medium">{Number(v.price).toLocaleString('vi-VN')}đ</span></span>
                                                    {v.salePrice && <span className="text-muted-foreground">KM: <span className="text-foreground">{Number(v.salePrice).toLocaleString('vi-VN')}đ</span></span>}
                                                    <span className="text-muted-foreground">Kho: <span className="text-foreground">{v.stock}</span></span>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-muted-foreground hover:text-foreground"
                                                        onClick={() => startEditVariant(v)}
                                                        title="Sửa loại"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteVariant(v.id)}
                                                        title="Xóa loại"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <Button 
                        type="button" 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => router.push('/seller/dashboard/products-manager')}
                    >
                        Hủy
                    </Button>
                    <Button className="flex-1" type="submit">{mode === 'add' ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm'}</Button>
                </div>
            </form>


        </div>
    );
};
