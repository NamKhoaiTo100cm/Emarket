"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";

interface FlashSaleSectionProps {
    products: any[];
}

export default function FlashSaleSection({ products }: FlashSaleSectionProps) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 45 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                } else {
                    clearInterval(timer);
                    return prev;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Filter products with discounts
    const flashProducts = products
        .filter((p) => p.salePrice && Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price))
        .slice(0, 6);

    if (flashProducts.length === 0) return null;

    const formatNumber = (num: number) => num.toString().padStart(2, "0");

    return (
        <section className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-2xl p-6 border border-orange-100 dark:border-orange-500/20 shadow-sm mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-500 font-extrabold text-2xl tracking-wide animate-pulse">
                        <Flame className="fill-orange-600 dark:fill-orange-500 w-7 h-7" />
                        <span>FLASH SALE</span>
                    </div>
                    {/* Timer blocks */}
                    <div className="flex items-center gap-1 ml-2 text-white font-bold text-sm">
                        <span className="bg-gray-900 px-2.5 py-1 rounded shadow-sm">{formatNumber(timeLeft.hours)}</span>
                        <span className="text-gray-900 dark:text-gray-300">:</span>
                        <span className="bg-gray-900 px-2.5 py-1 rounded shadow-sm">{formatNumber(timeLeft.minutes)}</span>
                        <span className="text-gray-900 dark:text-gray-300">:</span>
                        <span className="bg-gray-900 px-2.5 py-1 rounded shadow-sm">{formatNumber(timeLeft.seconds)}</span>
                    </div>
                </div>
                <button 
                    onClick={() => router.push("/search")} 
                    className="text-orange-600 dark:text-orange-400 text-sm font-semibold hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                    Xem tất cả &gt;
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {flashProducts.map((item) => {
                    const originalPrice = Number(item.price);
                    const salePrice = Number(item.salePrice);
                    const discountPercent = Math.floor(((originalPrice - salePrice) / originalPrice) * 100);
                    // Mock sold quantity progress
                    const soldCount = item.soldCount || Math.floor(Math.random() * 10) + 1;
                    const totalLimit = 15;
                    const percentSold = Math.min(100, Math.floor((soldCount / totalLimit) * 100));

                    return (
                        <div
                            key={item.id}
                            onClick={() => router.push(`/product-detail/${item.id}`)}
                            className="bg-white dark:bg-card/30 rounded-xl border border-gray-50 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                        >
                            <div className="relative aspect-square w-full bg-gray-50 dark:bg-zinc-900/40 overflow-hidden">
                                <Image
                                    src={item.images && item.images.length > 0 ? item.images[0].imageUrl : "/iphone-17-pro-max.webp"}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    -{discountPercent}%
                                </div>
                            </div>

                            <div className="p-3 flex flex-col gap-2">
                                <h4 className="text-xs font-medium text-gray-700 dark:text-zinc-100 line-clamp-1">
                                    {item.name}
                                </h4>
                                <div>
                                    <div className="text-red-500 font-bold text-sm">
                                        {salePrice.toLocaleString("vi-VN")} đ
                                    </div>
                                    <div className="text-[10px] line-through text-gray-400 dark:text-zinc-500">
                                        {originalPrice.toLocaleString("vi-VN")} đ
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-1 relative w-full h-4 bg-orange-100 dark:bg-orange-950/40 rounded-full overflow-hidden flex items-center justify-center">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500" 
                                        style={{ width: `${percentSold}%` }}
                                    />
                                    <span className="relative z-10 text-[9px] font-extrabold text-white uppercase drop-shadow-sm">
                                        {percentSold > 80 ? "Sắp cháy hàng" : `Đã bán ${soldCount}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
