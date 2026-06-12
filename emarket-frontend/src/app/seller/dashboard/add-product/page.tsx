"use client"
import FileUploadDropzone1 from "@/components/file-upload-dropzone-1";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/components/hooks/useAuth";
import { useEffect, useState } from "react";
import { useMyShop } from "@/components/hooks/useShop";
import { productService } from "@/services/product.service";
import { toast } from "sonner";
import categoryService from "@/services/category.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductEditorLayout from "@/components/layout/ProductEditorLayout";

const AddProductPage = () => {
    const { data: resUser } = useMe();
    const { data: resShop } = useMyShop(resUser?.data?.id, !!resUser?.data?.id);
    console.log("res", resUser);
    const [files, setFiles] = useState<File[]>([]);
    const myShop = resShop?.data;
    console.log("myShop user", myShop, resUser?.data);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    useEffect(() => {
        const getCategories = async () => {
            const res = await categoryService.getAll();
            if (res.statusCode === 200) {
                setCategories(res.data)
            } else {
                console.log("Error fetching categories", res);
            }
        }
        getCategories();
    }, [])




    const handleAddProduct = async (form: FormData) => {
        form.append("shopId", myShop?.id.toString());
        if (selectedCategoryId != "") {
            form.append("categoryId", selectedCategoryId);
        }

        // Lấy pending variants trước khi gửi (FormData không truyền được qua multipart)
        const pendingVariantsJson = form.get('_pendingVariants') as string | null;
        form.delete('_pendingVariants');

        // console.log("[AddProduct] pendingVariantsJson:", pendingVariantsJson);

        const response = await productService.createProduct(form);
        if (response.statusCode === 201) {
            toast.success("Thêm sản phẩm thành công");

            // Tạo variants nếu có
            const newProductId = response.data?.id;
            console.log("[AddProduct] newProductId:", newProductId);

            if (pendingVariantsJson && newProductId) {
                try {
                    const pendingVariants = JSON.parse(pendingVariantsJson);
                    console.log("[AddProduct] Creating variants:", pendingVariants);

                    const results = await Promise.allSettled(
                        pendingVariants.map((v: any) => productService.createVariant(newProductId, v))
                    );

                    const failed = results.filter(r => r.status === 'rejected');
                    const succeeded = results.filter(r => r.status === 'fulfilled');

                    if (succeeded.length > 0) {
                        toast.success(`Đã tạo ${succeeded.length} loại sản phẩm`);
                    }
                    if (failed.length > 0) {
                        console.error("[AddProduct] Failed variants:", failed.map(f => (f as PromiseRejectedResult).reason));
                        toast.error(`Có ${failed.length} loại sản phẩm tạo thất bại`, {
                            description: (failed[0] as PromiseRejectedResult).reason?.message || 'Lỗi không xác định'
                        });
                    }
                } catch (err: any) {
                    console.error("[AddProduct] Variant creation error:", err);
                    toast.warning("Sản phẩm đã tạo nhưng có lỗi khi tạo loại sản phẩm", {
                        description: err?.message || String(err)
                    });
                }
            } else {
                console.log("[AddProduct] No variants to create. pendingVariantsJson:", pendingVariantsJson, "newProductId:", newProductId);
            }
        } else {
            toast.error("Thêm sản phẩm thất bại ", { description: response.message })
        }
    }
    return (
        <ProductEditorLayout mode="add" handleAddProduct={handleAddProduct} categories={categories} />
    );
};

export default AddProductPage;