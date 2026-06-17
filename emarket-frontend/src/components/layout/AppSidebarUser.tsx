"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, PlusIcon, Store, ShoppingCart, Package, User } from "lucide-react"
import Image from "next/image"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
        role: "USER",
    },
    teams: [
        {
            name: "EMarket",
            logo: (
                // <Image src="https://res.cloudinary.com/dxsf6iomu/image/upload/v1777483395/shops/avatars/oikskkhdb2izkbgiellh.png" alt="" width={30} height={30} className="w-8 h-8 rounded-full" />
                <Store
                    className="w-8 h-8 rounded-full" />
            ),
            plan: "User Manager",
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
            title: "Thông tin khách hàng",
            url: "/user/profile",
            icon: (
                <User />
            ),
        },
        {
            title: "Thông tin đơn hàng",
            url: "/user/orders",
            icon: (
                <Package />
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
}


export function AppSidebarUser({ onSelectedNavMain, ...props }: React.ComponentProps<typeof Sidebar> & { onSelectedNavMain: (item: any) => void }) {

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} onSelectedNavMain={onSelectedNavMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
