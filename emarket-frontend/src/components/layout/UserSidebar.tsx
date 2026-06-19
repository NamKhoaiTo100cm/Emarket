"use client"
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserSidebar() {
    const path = usePathname();
    const tabs = [
        {
            name: 'Thông tin tài khoản',
            value: 'profile',
            count: 8,
            path: '/user/profile'
        },
        {
            name: 'Thông tin đơn hàng',
            value: 'orders',
            count: 3,
            path: '/user/orders',
        },
        {
            name: 'Tin nhắn',
            value: 'chat',
            count: 2,
            path: '/user/chat',
        },

        // {
        //     name: 'Cài đặt',
        //     value: 'settings',
        //     count: 6,
        //     path: '/user/settings',
        // }
    ]


    return (
        <TabsList className='h-full flex-col gap-1.5'>
            {tabs.map(tab => (

                <TabsTrigger
                    value={tab.value}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
                        "hover:bg-muted",
                        tab.path === path &&
                        "bg-muted font-medium",
                    )}
                    asChild key={tab.value}>
                    <Link href={tab.path} >
                        {tab.name}
                        {/* <Badge className='h-5 min-w-5 px-1 tabular-nums'>{tab.count}</Badge> */}
                    </Link>
                </TabsTrigger>

            ))}
        </TabsList>


    )
}