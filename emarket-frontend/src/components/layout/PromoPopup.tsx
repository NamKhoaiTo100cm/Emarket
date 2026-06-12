"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { bannerService } from "@/services/banner.service"
import { Button } from "@/components/ui/button"

export default function PromoPopup() {
    const [popupOpen, setPopupOpen] = useState(false)
    const [popupBanner, setPopupBanner] = useState<any>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return;

        const loadPopupBanner = async () => {
            try {
                const res = await bannerService.getActiveBanners();
                const activeBanners = res.data || [];
                
                // Filter popup banners
                const popupItems = activeBanners.filter((b: any) => b.position === "popup");
                if (popupItems.length > 0) {
                    const hasShown = sessionStorage.getItem("hasShownPromoPopup");
                    if (!hasShown) {
                        setPopupBanner(popupItems[0]);
                        // Show modal with 1.5 seconds delay
                        const timer = setTimeout(() => {
                            setPopupOpen(true);
                        }, 1500);
                        return () => clearTimeout(timer);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi tải popup banner từ server:", err);
            }
        };

        loadPopupBanner();
    }, [mounted]);

    // Prevent scrolling when popup is open
    useEffect(() => {
        if (popupOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [popupOpen]);

    if (!mounted || !popupOpen || !popupBanner) return null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 p-0 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={() => {
                        setPopupOpen(false);
                        sessionStorage.setItem("hasShownPromoPopup", "true");
                    }}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center font-bold transition-colors border border-white/20"
                    aria-label="Close promotion dialog"
                >
                    <X className="w-4 h-4" />
                </button>
                
                {/* Clickable Image Banner */}
                {popupBanner.link ? (
                    <Link 
                        href={popupBanner.link}
                        onClick={() => {
                            setPopupOpen(false);
                            sessionStorage.setItem("hasShownPromoPopup", "true");
                        }}
                    >
                        <div className="relative w-full h-[400px]">
                            <Image 
                                src={popupBanner.imageUrl} 
                                alt={popupBanner.title || "Khuyến mãi"} 
                                fill 
                                priority
                                className="object-cover object-center cursor-pointer hover:scale-[1.02] transition-transform duration-500" 
                            />
                        </div>
                    </Link>
                ) : (
                    <div className="relative w-full h-[400px]">
                        <Image 
                            src={popupBanner.imageUrl} 
                            alt={popupBanner.title || "Khuyến mãi"} 
                            fill 
                            priority
                            className="object-cover object-center" 
                        />
                    </div>
                )}
                
                {/* Title and Call to action footer */}
                {popupBanner.title && (
                    <div className="p-5 text-center bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
                            {popupBanner.title}
                        </h3>
                        {popupBanner.link && (
                            <Link 
                                href={popupBanner.link}
                                onClick={() => {
                                    setPopupOpen(false);
                                    sessionStorage.setItem("hasShownPromoPopup", "true");
                                }}
                            >
                                <Button className="mt-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 font-semibold shadow-md">
                                    Khám phá ngay
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
