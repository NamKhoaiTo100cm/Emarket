"use server"
import ProductList from "@/components/cards/ProductList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShop } from "@/actions/shop.action";
import { MessageSquare, Store, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";
import { getProducts, getProductsByShopId } from "@/actions/product.action";
import Link from "next/link";
import VerifiedBadge from "@/components/ui/verified-badge";
import Image from "next/image";
import ReportButton from "@/components/ui/report-button";

export default async function ShopDetailPage({ params }: { params: { id: string } }) {

    const { id } = await params;
    const shop = await getShop(Number(id));
    const productOfShop = await getProductsByShopId(Number(id), 1, 20);
    if (!shop) {
        console.log("Shop not found");
        return;
    }

    return (
        <div className="px-15 lg:px-20">
            <Card className="pt-0 overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
                {/* shop banner */}
                <div className="h-45 bg-amber-500 relative">
                    {shop?.banner && (
                        <Image src={shop.banner} alt="shop banner" fill className="object-cover" />
                    )}
                </div>
                <div className="px-5 pb-5">
                    <div className="flex flex-col md:flex-row gap-5 items-center md:items-end relative z-10">
                        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-900 shadow-md -mt-12 md:-mt-16 relative">
                            <Image src={shop?.logo || "/default-shop.png"} alt="shop logo" fill className="object-cover" />
                        </div>
                        <div className="flex-1 text-center md:text-left mt-4 md:mt-0 pb-2">
                            <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                                {shop?.name || "Shop Name"}
                                {shop?.isVerified && <VerifiedBadge size="lg" showLabel />}
                            </h1>
                            <div className="mt-2 flex justify-center md:justify-start gap-2">
                                <Button variant="outline"><UserPlus />Theo dõi</Button>
                                <Link href={`/user/chat/${shop.id}`}><Button variant="default" className="ml-1"><MessageSquare />Chat</Button></Link>
                                <ReportButton type="shop" targetId={shop.id} />
                            </div>
                        </div>
                        {/* Shop info */}
                        <div className="flex items-center gap-10 border-t md:border-t-0 md:border-l pt-4 md:pt-0 pl-0 md:pl-10 w-full md:w-auto justify-center">
                            <div className="space-y-2">
                                <p className="text-center font-medium">{shop.productCount || 0} sản phẩm</p>
                                <p className="text-center text-sm text-slate-500">100k theo dõi</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-center font-medium">{shop.address || "Location"}</p>
                                <p className="text-center text-sm text-slate-500">Đã tham gia {shop.createdAt ? new Date(shop.createdAt).getFullYear() : "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
                {/* tab content */}
                <div className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">Giới thiệu shop:</p>
                    {shop.description || "Chưa có mô tả chi tiết."}
                </div>

            </Card>

            <div className="mt-5">
                <h1 className="text-2xl font-bold mb-3">Các sản phẩm của shop</h1>
                <ProductList products={productOfShop} />
            </div>

        </div>
    );
}