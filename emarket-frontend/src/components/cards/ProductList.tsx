"use client"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useRouter } from 'next/navigation'

const ProductList = ({ products }: { products: any[] }) => {
    const router = useRouter();
    const handleCardProcductClick = (id: number) => {
        router.push(`/product-detail/${id}`);
    }
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-4'>
            {products && products?.length > 0 && products?.map((item: any) => {
                const hasDiscount = item.salePrice && Number(item.salePrice) > 0 && Number(item.salePrice) < Number(item.price);
                const activePrice = hasDiscount ? Number(item.salePrice) : Number(item.price);
                return (
                    <div
                        onClick={() => handleCardProcductClick(item.id)}
                        key={item.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-card/30 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                        {/* Top Badge: Favorite/Mall */}
                        {/* <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                Yêu thích
                            </span>
                        </div> */}

                        {/* Image Container */}
                        <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-zinc-900/40">
                            <Image
                                src={item.images && item.images.length > 0 ? item.images[0].imageUrl : "/iphone-17-pro-max.webp"}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {hasDiscount && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                                    -{Math.floor((Number(item.price) - Number(item.salePrice)) / Number(item.price) * 100)}%
                                </div>
                            )}
                        </div>

                        {/* Card Info */}
                        <div className="flex flex-col gap-1.5 p-3">
                            <h3 className="text-sm font-medium text-gray-800 dark:text-zinc-100 line-clamp-2 min-h-[40px] group-hover:text-orange-500 transition-colors">
                                {item.name}
                            </h3>

                            <div className="flex flex-col gap-0.5">
                                <span className="text-red-500 font-semibold text-base">
                                    {activePrice.toLocaleString('vi-VN')} đ
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs line-through text-gray-400 dark:text-zinc-500">
                                        {Number(item.price).toLocaleString('vi-VN')} đ
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800 pt-2 mt-1">
                                <span>Đã bán {item.soldCount || 0}</span>
                                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-1 py-0.5 rounded">HN</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default ProductList