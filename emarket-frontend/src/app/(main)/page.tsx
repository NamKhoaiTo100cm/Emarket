

import CategoryCards from "@/components/cards/CategoryList"
import ProductList from "@/components/cards/ProductList"
import BannerSlider from "@/components/layout/BannerSlider"
import PromoPopup from "@/components/layout/PromoPopup"
import FlashSaleSection from "@/components/layout/FlashSaleSection"
import { getProducts } from "@/actions/product.action"

const HomePage = async () => {
  const products = await getProducts(1, 20);
  return (
    <div className="space-y-10 lg:mx-10 py-6">
      {/* Banner hero section */}
      <BannerSlider />
      
      {/* Landing promo popup overlay */}
      <PromoPopup />

      {/* Flash Sale Section */}
      <FlashSaleSection products={products} />

      {/* Category Section */}
      <section className="bg-white dark:bg-card/50 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800/80 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
          Danh mục sản phẩm
        </h3>
        <CategoryCards />
      </section>

      {/* Product List Section */}
      <section className="bg-white dark:bg-card/50 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800/80 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-orange-500 rounded-full" />
          Gợi ý hôm nay
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6 ml-3.5">Những sản phẩm hàng đầu dành cho bạn</p>
        <ProductList products={products} />
      </section>
    </div>
  )
}

export default HomePage