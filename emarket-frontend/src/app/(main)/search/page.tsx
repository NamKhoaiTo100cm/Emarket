"use client";
import ProductList from "@/components/cards/ProductList";
import { useProducts } from "@/components/hooks/useProduct";
import { PaginationLayout } from "@/components/layout/PaginationLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import categoryService from "@/services/category.service";
import { FilterIcon, Star } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SearchPage = () => {
    const searchParams = useSearchParams();
    const keyword = searchParams.get("keyword");
    const router = useRouter();
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 30,
        totalItems: 0,
        totalPages: 0,
    })
    const [rating, setRating] = useState<number>(0);
    const [categorySlug, setCategorySlug] = useState<string>(searchParams.get("categorySlug") || "");
    const [tempMinPrice, setTempMinPrice] = useState<string>("");
    const [tempMaxPrice, setTempMaxPrice] = useState<string>("");
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

    useEffect(() => {
        setCategorySlug(searchParams.get("categorySlug") || "");
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, [searchParams]);

    const { data: res, isLoading, isError } = useProducts(
        pagination.page,
        pagination.pageSize,
        keyword || "",
        rating,
        categorySlug,
        minPrice,
        maxPrice
    );

    const handleApplyPriceRange = () => {
        const min = tempMinPrice ? Number(tempMinPrice) : undefined;
        const max = tempMaxPrice ? Number(tempMaxPrice) : undefined;
        setMinPrice(min);
        setMaxPrice(max);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleClearPriceRange = () => {
        setTempMinPrice("");
        setTempMaxPrice("");
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    useEffect(() => {
        if (res) {
            categoryService.getAll().then((data) => {
                setCategories(data.data)
            })
            setProducts(res.data)
            setPagination({
                ...pagination,
                totalItems: res.pagination.totalCount,
                totalPages: Number(Math.ceil(res.pagination.totalCount / pagination.pageSize))
            })
        }
    }, [res])


    const onPageChange = (newPage: number) => {
        setPagination((prev) => ({
            ...prev,
            page: newPage
        }))

    }
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <p>Đang tải...</p>
        </div>
    }
    // if (products && products.length === 0 && res) {
    //     return <div className="flex justify-center items-center h-screen">
    //         <p>Không tìm thấy sản phẩm cho từ khóa <span className="text-red-500">"{keyword}"</span></p>
    //     </div>
    // }
    return (
        <div className="mx-5 md:mx-10 flex flex-row gap-6 p-0">
            <div className="border border-red flex flex-col gap-4 basis-1/5">
                <div className="flex items-center gap-3">
                    <FilterIcon />
                    <h1 className="text-lg font-semibold">Bộ lọc tìm kiếm</h1>
                </div>
                <div>
                    <h1 className="text-md font-semibold mb-2">Danh mục</h1>
                    <RadioGroup className="w-fit" onValueChange={(value) => setCategorySlug(value)} value={categorySlug}>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="" id="r1" />
                            <Label htmlFor="r1">Tất cả</Label>
                        </div>
                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center gap-3">
                                <RadioGroupItem value={category.slug} id={category.slug} />
                                <Label htmlFor={category.slug}>{category.name}</Label>
                            </div>
                        ))}
                        {/* <div className="flex items-center gap-3">
                            <RadioGroupItem value="1" id="r2" />
                            <Label htmlFor="r2">Điện thoại</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="2" id="r3" />
                            <Label htmlFor="r3">Máy tính</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="3" id="r4" />
                            <Label htmlFor="r4">Máy tính bảng</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="4" id="r5" />
                            <Label htmlFor="r5">Máy ảnh</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="5" id="r6" />
                            <Label htmlFor="r6">Tai nghe</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="6" id="r7" />
                            <Label htmlFor="r7">Loa</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="7" id="r8" />
                            <Label htmlFor="r8">Đồng hồ</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="8" id="r9" />
                            <Label htmlFor="r9">Phụ kiện</Label>
                        </div> */}
                    </RadioGroup>
                </div>
                <div>
                    <h1 className="text-md font-semibold mb-2">Khoảng giá</h1>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Giá từ"
                            value={tempMinPrice}
                            onChange={(e) => setTempMinPrice(e.target.value)}
                        />
                        <span className="">-</span>
                        <Input
                            type="number"
                            placeholder="Giá đến"
                            value={tempMaxPrice}
                            onChange={(e) => setTempMaxPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <Button className="w-full" onClick={handleApplyPriceRange}>Áp dụng</Button>
                        {(tempMinPrice || tempMaxPrice || minPrice !== undefined || maxPrice !== undefined) && (
                            <Button variant="outline" className="w-full" onClick={handleClearPriceRange}>Xóa</Button>
                        )}
                    </div>
                </div>

                <div>
                    <h1 className="text-md font-semibold mb-2">Đánh giá từ {rating} sao trở lên</h1>
                    <RadioGroup className="w-fit"
                        onValueChange={(value) => setRating(Number(value))}
                        value={rating.toString()}
                        defaultValue="1"                   >
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="5" id="r5" />
                            <Label htmlFor="r5"><Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /></Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="4" id="r4" />
                            <Label htmlFor="r4"><Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star /> </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="3" id="r3" />
                            <Label htmlFor="r3"><Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star /> <Star /> </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="2" id="r2" />
                            <Label htmlFor="r2"><Star fill="yellow" color="yellow" /> <Star fill="yellow" color="yellow" /> <Star /> <Star /> <Star /> </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="1" id="r2" />
                            <Label htmlFor="r2"><Star fill="yellow" color="yellow" /> <Star /> <Star /> <Star /> <Star /> </Label>
                        </div>
                    </RadioGroup>
                </div>

            </div>
            <div className=" basis-4/5">
                {(products && products.length === 0 && res) && <div className="flex justify-center items-center h-screen">
                    <p>Không tìm thấy sản phẩm cho từ khóa <span className="text-red-500">"{keyword}"</span>  danh mục <span className='text-red-500'>{categories.find(c => c.slug === categorySlug)?.name}</span></p>
                </div>}
                {!(products && products.length === 0 && res) && <p className="text-md font-semibold mb-2">Có {products.length} kết quả cho từ khóa <span className="text-red-500">'{keyword}'</span></p>}
                <Card>
                    <CardContent className="">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2 w-full ">
                                <h1 className="text-sm">Sắp xếp theo</h1>
                                <Button>Liên quan</Button>
                                <Button>Bán chạy</Button>
                                <Select>
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder="Giá" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="asc">Từ thấp đến cao</SelectItem>
                                            <SelectItem value="desc">Từ cao đến thấp</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <div className="ml-auto">
                                    <PaginationLayout currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={onPageChange} />

                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>
                <div className="mt-5">
                    <ProductList products={products} />
                </div>
            </div>
        </div>
    );
};

export default SearchPage;