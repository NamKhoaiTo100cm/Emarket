
import { getCategories } from "@/actions/categories.action"
import { Card } from "@/components/ui/card"
import Link from "next/link"

type Category = {
    name: string,
    icon: string,
}
const CategoryCards = async () => {
    const categories = await getCategories();
    // const [categorys, setCategory] = useState<Category[]>([{ icon: "📱", name: "Điện thoại" },
    // { icon: "🖥️", name: "Máy tính" },
    // { icon: "🎧", name: "Phụ kiện" },
    // { icon: "💻", name: "Laptop" },
    // { icon: "💘", name: "Sức khỏe" },
    // { icon: "🛍️", name: "Tiêu dùng" },
    // { icon: "👕", name: "Thời trang" },
    // { icon: "⚡", name: "Đồ điện" },
    // { icon: "🎮", name: "Games" },
    // { icon: "🔞", name: "18+" }
    // ]);
    return (
        <div className="md:mx-16 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3 md:gap-5">
            {categories && categories.length > 0 && categories.map((item: any, index: number) => (
                <Link href={`/search?categorySlug=${item.slug}`} key={index} className="block">
                    <Card className="w-27 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex flex-col items-center p-2">
                            <span className="text-2xl">
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium mt-1 text-center">
                                {item.name}
                            </span>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

export default CategoryCards