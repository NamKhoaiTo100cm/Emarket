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
import { AudioLinesIcon, FrameIcon, Home, MapIcon, MessageCircle, Package, PieChartIcon, PlusIcon, Settings2Icon, ShieldCheck, ShoppingCart, Store, TerminalIcon, User, Undo2, ShieldAlert } from "lucide-react"
import { AppSidebarSeller } from "@/components/app-sidebar"


let data = {
    user: {
        name: "name",
        email: "email@email.com",
        avatar: "avatar",
    },
    teams: [
        {
            name: "Emarket",
            logo: (
                // <Image src="https://res.cloudinary.com/dxsf6iomu/image/upload/v1777483395/shops/avatars/oikskkhdb2izkbgiellh.png" alt="" width={30} height={30} className="w-8 h-8 rounded-full" />
                <Store
                    className="w-8 h-8 rounded-full" />
            ),
            plan: "Staff Dashboard",
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
            title: "Quản lý shop",
            url: "/staff/dashboard/shop-manager",
            icon: (
                <Home />
            ),
        },
        {
            title: "Quản lý sản phẩm",
            url: "/staff/dashboard/products-manager",
            icon: (
                <Package />
            ),
        },
        {
            title: "Quản lý người dùng",
            url: "/staff/dashboard/users-manager",
            icon: (
                <User />
            ),
        },
        {
            title: "Quản lý đánh giá",
            url: "/staff/dashboard/reviews-manager",
            icon: (
                <MessageCircle />
            ),
        },
        {
            title: "Quản lý trả hàng",
            url: "/staff/dashboard/returns-manager",
            icon: (
                <Undo2 />
            ),
        },
        {
            title: "Quản lý báo cáo",
            url: "/staff/dashboard/reports-manager",
            icon: (
                <ShieldAlert />
            ),
        },
        {
            title: "Chat hỗ trợ khách hàng",
            url: "/staff/dashboard/chat-support",
            icon: (
                <MessageCircle />
            ),
        },
        {
            title: "Xác thực shop",
            url: "/staff/dashboard/verifications",
            icon: (
                <ShieldCheck />
            ),
        }
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

export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {

    const [selectedNavMain, setSelectedNavMain] = useState<any>(null);
    const { data: resp, isLoading: isMeLoading, error: meError } = useMe();
    const [data1, setData1] = useState(data);
    const handleSelectNavMain = (item: any) => {
        setSelectedNavMain(item);
    }
    useEffect(() => {
        if (resp) {
            const user = resp.data;

            setData1({ ...data, user: { name: user.name, email: user.email, avatar: user.avatar } });
            console.log("dt1: ", data1)
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
