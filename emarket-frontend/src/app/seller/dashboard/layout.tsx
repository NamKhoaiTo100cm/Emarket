"use client"
import FileUploadDropzone1 from "@/components/file-upload-dropzone-1"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { useMe } from "@/components/hooks/useAuth"
import { useParams } from "next/navigation"
import { Children, useEffect, useState } from "react"
import { AudioLinesIcon, FrameIcon, MapIcon, MessageCircle, Package, PieChartIcon, PlusIcon, Settings2Icon, ShieldCheck, ShoppingCart, Store, Tag, TerminalIcon } from "lucide-react"
import { AppSidebarSeller } from "@/components/app-sidebar"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: (
                // <Image src="https://res.cloudinary.com/dxsf6iomu/image/upload/v1777483395/shops/avatars/oikskkhdb2izkbgiellh.png" alt="" width={30} height={30} className="w-8 h-8 rounded-full" />
                <Store
                    className="w-8 h-8 rounded-full" />
            ),
            plan: "Seller Dashboard",
        },
        {
            name: "Acme Corp.",
            logo: (
                <AudioLinesIcon
                />
            ),
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: (
                <TerminalIcon
                />
            ),
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Thống kê & Biểu đồ",
            url: "/seller/dashboard/statistics",
            icon: (
                <PieChartIcon />
            ),
        },
        {
            title: "Thêm sản phẩm",
            url: "/seller/dashboard/add-product",
            icon: (
                <PlusIcon />
            ),
            // isActive: true,
            // items: [
            //   {
            //     title: "History",
            //     url: "#",
            //   },
            //   {
            //     title: "Starred",
            //     url: "#",
            //   },
            //   {
            //     title: "Settings",
            //     url: "#",
            //   },
            //],
        },
        {
            title: "Quản lý sản phẩm",
            url: "/seller/dashboard/products-manager",
            icon: (
                <Package />
            ),
            // items: [
            //   {
            //     title: "Genesis",
            //     url: "#",
            //   },
            //   {
            //     title: "Explorer",
            //     url: "#",
            //   },
            //   {
            //     title: "Quantum",
            //     url: "#",
            //   },
            // ],
        },
        {
            title: "Quản lý đơn hàng",
            url: "/seller/dashboard/orders-manager",
            icon: (
                <ShoppingCart
                />
            ),
            // items: [
            //   {
            //     title: "Introduction",
            //     url: "#",
            //   },
            //   {
            //     title: "Get Started",
            //     url: "#",
            //   },
            //   {
            //     title: "Tutorials",
            //     url: "#",
            //   },
            //   {
            //     title: "Changelog",
            //     url: "#",
            //   },
            // ],
        },
        {
            title: "Thông tin shop",
            url: "/seller/dashboard/shop-profile",
            icon: (
                <Store />
            ),
        },
        {
            title: "Chat",
            url: "/seller/dashboard/chat",
            icon: (
                <MessageCircle />
            ),
        },
        {
            title: "Quản lý mã giảm giá",
            url: "/seller/dashboard/vouchers-manager",
            icon: (
                <Tag />
            ),
        },
        {
            title: "Số dư",
            url: "/seller/dashboard/balance",
            icon: (
                <Tag />
            ),
        },
        {
            title: "Xác thực shop",
            url: "/seller/dashboard/verification",
            icon: (
                <ShieldCheck />
            ),
        },
        {
            title: "Settings",
            url: "#",
            icon: (
                <Settings2Icon
                />
            ),
            // items: [
            //   {
            //     title: "General",
            //     url: "#",
            //   },
            //   {
            //     title: "Team",
            //     url: "#",
            //   },
            //   {
            //     title: "Billing",
            //     url: "#",
            //   },
            //   {
            //     title: "Limits",
            //     url: "#",
            //   },
            // ],
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: (
                <FrameIcon
                />
            ),
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: (
                <PieChartIcon
                />
            ),
        },
        {
            name: "Travel",
            url: "#",
            icon: (
                <MapIcon
                />
            ),
        },
    ],
}
export default function Page({ children }: { children: React.ReactNode }) {

    const [selectedNavMain, setSelectedNavMain] = useState<any>(null);
    const { data: resp, isLoading: isMeLoading, error: meError } = useMe();
    const [data1, setData1] = useState(data);
    const handleSelectNavMain = (item: any) => {
        setSelectedNavMain(item);
    }
    useEffect(() => {
        if (resp) {
            const user = resp.data;
            if (user.role === 'seller' && user.shop?.status === 'banned') {
                alert('Cửa hàng của bạn đã bị khóa. Bạn không thể truy cập trang quản lý.');
                window.location.href = '/';
                return;
            }

            setData1({ ...data, user: { name: user.name, email: user.email, avatar: user.avatar } });
            console.log("dt1: ", user)
        }
    }, [resp]);
    return (
        <SidebarProvider>
            <AppSidebarSeller data={data1} onSelectedNavMain={handleSelectNavMain} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        {selectedNavMain?.title || "Build Your Application"}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {/* <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                </BreadcrumbItem> */}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
