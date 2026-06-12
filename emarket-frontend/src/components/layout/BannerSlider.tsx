"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { bannerService } from "@/services/banner.service"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"

const defaultBanners = [
    {
        id: -1,
        title: "Điện thoại chính hãng",
        description:
            "iPhone, Samsung, Xiaomi giá cực tốt mỗi ngày",
        button: "Mua ngay",
        image:
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
        link: "/search?keyword=dien%20thoai",
    },
    {
        id: -2,
        title: "Gaming Gear cao cấp",
        description:
            "Chuột, bàn phím, tai nghe dành cho game thủ",
        button: "Khám phá",
        image:
            "/gaming-banner.jpg",
        link: "/search?keyword=chuot",
    },
    {
        id: -3,
        title: "Thời trang mùa hè",
        description:
            "Giảm đến 50% toàn bộ sản phẩm hot trend",
        button: "Xem ngay",
        image:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
        link: "/search?keyword=ao",
    },
]

interface DisplayBanner {
    id: number;
    title: string | null;
    description?: string;
    button?: string;
    image: string;
    link?: string | null;
}

export default function HeroBanner() {
    const [banners, setBanners] = useState<DisplayBanner[]>(defaultBanners)
    const [subBanners, setSubBanners] = useState<any[]>([])
    const [current, setCurrent] = useState(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const loadBanners = async () => {
            try {
                const res = await bannerService.getActiveBanners();
                const activeBanners = res.data || [];
                
                // 1. Filter only main position banners
                const mainBanners = activeBanners.filter((b: any) => b.position === "main");
                if (mainBanners && mainBanners.length > 0) {
                    const mapped = mainBanners.map((b: any) => ({
                        id: b.id,
                        title: b.title,
                        description: "",
                        button: "Xem ngay",
                        image: b.imageUrl,
                        link: b.link,
                    }));
                    setBanners(mapped);
                }

                // 2. Filter only sub position banners
                const sideBanners = activeBanners.filter((b: any) => b.position === "sub");
                setSubBanners(sideBanners);
            } catch (err) {
                console.error("Lỗi khi tải banner từ server, sử dụng banner mặc định:", err);
            }
        };
        loadBanners();
    }, []);

    const nextSlide = () => {
        setCurrent((prev) =>
            prev === banners.length - 1 ? 0 : prev + 1
        )
    }

    const prevSlide = () => {
        setCurrent((prev) =>
            prev === 0 ? banners.length - 1 : prev - 1
        )
    }

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            nextSlide()
        }, 5000)

        return () => clearInterval(timer)
    }, [banners])

    return (
        <>
            <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                {/* Main Slider */}
                <Card className="relative overflow-hidden rounded-xl border-0 p-0 shadow-sm h-[320px] md:h-[400px]">
                    <CardContent className="relative h-full overflow-hidden p-0">
                        {banners.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`absolute inset-0 transition-all duration-700 ${current === index
                                    ? "opacity-100"
                                    : "pointer-events-none opacity-0"
                                    }`}
                            >
                                {banner.image && (
                                    <Image
                                        src={banner.image}
                                        alt={banner.title || "Banner"}
                                        fill
                                        priority
                                        className="object-cover object-center"
                                    />
                                )}

                                <div className="absolute inset-0 bg-black/30" />

                                <div className="relative z-10 flex h-full max-w-xl flex-col justify-center px-10 ml-5">
                                    <span className="mb-4 w-fit rounded-full bg-white/20 text-white text-xs font-semibold px-3 py-1 backdrop-blur">
                                        Bộ sưu tập mới
                                    </span>

                                    {banner.title && (
                                        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                                            {banner.title}
                                        </h1>
                                    )}

                                    {banner.description && (
                                        <p className="mt-4 text-sm md:text-base text-white/90">
                                            {banner.description}
                                        </p>
                                    )}

                                    {banner.link ? (
                                        <Link href={banner.link} passHref>
                                            <Button
                                                size="lg"
                                                className="mt-6 w-fit rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md px-6"
                                            >
                                                {banner.button || "Xem ngay"}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            size="lg"
                                            className="mt-6 w-fit rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md px-6"
                                        >
                                            {banner.button || "Xem ngay"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Navigation */}
                        {banners.length > 1 && (
                            <>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={prevSlide}
                                    className="absolute left-5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/50 hover:bg-white text-black border-0 backdrop-blur"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                <Button
                                    size="icon"
                                    variant="secondary"
                                    onClick={nextSlide}
                                    className="absolute right-5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/50 hover:bg-white text-black border-0 backdrop-blur"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>

                                {/* Dots */}
                                <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                                    {banners.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrent(index)}
                                            className={`h-2 rounded-full transition-all ${current === index
                                                ? "w-6 bg-orange-500"
                                                : "w-2 bg-white/60"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Side Cards */}
                <div className="flex flex-col gap-4 lg:h-[400px]">
                    {/* Card 1: Custom sub banner 1 or default Freeship card */}
                    {subBanners[0] ? (
                        <Card className="flex-1 rounded-xl border-0 shadow-sm overflow-hidden relative group min-h-[150px]">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10 pointer-events-none" />
                            {subBanners[0].link ? (
                                <Link href={subBanners[0].link} className="block w-full h-full relative">
                                    <Image 
                                        src={subBanners[0].imageUrl} 
                                        alt={subBanners[0].title || "Sub Banner 1"} 
                                        fill 
                                        className="object-cover object-center group-hover:scale-102 transition-transform duration-300" 
                                    />
                                    {subBanners[0].title && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
                                            <span className="text-white font-bold text-sm">{subBanners[0].title}</span>
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className="w-full h-full relative">
                                    <Image 
                                        src={subBanners[0].imageUrl} 
                                        alt={subBanners[0].title || "Sub Banner 1"} 
                                        fill 
                                        className="object-cover object-center" 
                                    />
                                    {subBanners[0].title && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
                                            <span className="text-white font-bold text-sm">{subBanners[0].title}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card className="flex-1 rounded-xl border-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm overflow-hidden relative group">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                            <CardContent className="relative z-10 flex h-full items-center justify-between p-6">
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur">
                                            FREESHIP XTRA
                                        </span>
                                        <h2 className="mt-3 text-xl font-bold leading-tight">
                                            Miễn phí vận chuyển<br />đơn từ 0đ
                                        </h2>
                                    </div>
                                    <Button className="mt-4 rounded-full bg-white text-indigo-600 hover:bg-white/90 font-semibold w-fit px-4 text-xs">
                                        Xem ngay
                                    </Button>
                                </div>
                                <div className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-300">🚚</div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Card 2: Custom sub banner 2 or default Voucher card */}
                    {subBanners[1] ? (
                        <Card className="flex-1 rounded-xl border-0 shadow-sm overflow-hidden relative group min-h-[150px]">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 z-10 pointer-events-none" />
                            {subBanners[1].link ? (
                                <Link href={subBanners[1].link} className="block w-full h-full relative">
                                    <Image 
                                        src={subBanners[1].imageUrl} 
                                        alt={subBanners[1].title || "Sub Banner 2"} 
                                        fill 
                                        className="object-cover object-center group-hover:scale-102 transition-transform duration-300" 
                                    />
                                    {subBanners[1].title && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
                                            <span className="text-white font-bold text-sm">{subBanners[1].title}</span>
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className="w-full h-full relative">
                                    <Image 
                                        src={subBanners[1].imageUrl} 
                                        alt={subBanners[1].title || "Sub Banner 2"} 
                                        fill 
                                        className="object-cover object-center" 
                                    />
                                    {subBanners[1].title && (
                                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
                                            <span className="text-white font-bold text-sm">{subBanners[1].title}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ) : (
                        <Card className="flex-1 rounded-xl border-0 bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm overflow-hidden relative group">
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                            <CardContent className="relative z-10 flex h-full items-center justify-between p-6">
                                <div className="flex flex-col h-full justify-between">
                                    <div>
                                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur">
                                            VOUCHER GIẢM ĐẾN
                                        </span>
                                        <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
                                            500K
                                        </h2>
                                    </div>
                                    <Button className="mt-4 rounded-full bg-white text-orange-600 hover:bg-white/90 font-semibold w-fit px-4 text-xs">
                                        Sưu tầm ngay
                                    </Button>
                                </div>
                                <div className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-300">🎫</div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </>
    )
}