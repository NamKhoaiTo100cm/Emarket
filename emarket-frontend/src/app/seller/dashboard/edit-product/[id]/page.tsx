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
import { useParams } from "next/navigation";

export default function EditProductPage() {
    const { data: resUser } = useMe();
    const { data: resShop } = useMyShop(resUser?.data?.id, !!resUser?.data?.id);
    console.log("res", resUser);
    const [files, setFiles] = useState<File[]>([]);
    const myShop = resShop?.data;
    console.log("myShop user", myShop, resUser?.data);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const params = useParams();
    const productId = params.id;
    const [product, setProduct] = useState<any>(null);
    const [oldImages, setOldImages] = useState([]);

    useEffect(() => {
        const getCategories = async () => {
            const res = await categoryService.getAll();
            if (res.statusCode === 200) {
                setCategories(res.data)
            } else {
                console.log("Error fetching categories", res);
            }
        }
        const getProduct = async () => {
            const res = await productService.getOne(Number(productId));
            if (res.statusCode === 200) {
                setProduct(res.data);
                const images = res.data.images;

                setOldImages(images || []);
            } else {
                console.log("Error fetching product", res);
            }
        }
        getCategories();
        getProduct();
    }, []);


    const handleEditProduct = async (form: FormData) => {
        // form.append("shopId", myShop?.id.toString());
        if (selectedCategoryId != "") {
            form.append("categoryId", selectedCategoryId);
        }
        // console.log("form", form);
        // if (product?.id) {
        //     form.append("id", product.id.toString());
        // } else {
        //     toast.error("Lỗi dữ liệu sản phẩm")
        //     return
        // }
        console.log("categoryId", form.get("categoryId"))

        const response = await productService.updateProduct(Number(productId), form);
        if (response.statusCode === 200) {
            toast.success("Cập nhật sản phẩm thành công")
        } else {
            toast.error("Cập nhật sản phẩm thất bại ", { description: response.message })
        }
    }
    return (
        <ProductEditorLayout mode="edit" product={product} handleUpdateProduct={handleEditProduct} categories={categories} />
    );
};

