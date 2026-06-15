"use client"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '../ui/navigation-menu'
import Link from 'next/link'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import ModeToggle from '../ui/ModeToggle'
import { useCartStore } from '@/stores/useCartStore'
import { useEffect, useState } from 'react'
import CartPopup from './CartPopup'
import { FaShoppingCart, FaSearch } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useLogout, useMe } from '../hooks/useAuth'
import { queryClient } from '@/lib/queryClient'
import AnnouncementBar from '../ui/announcement-bar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { QueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import {
    useNotifications,
    useNotificationUnreadCount,
    useMarkNotificationRead,
    useMarkAllNotificationsRead
} from '../hooks/useNotification'



export default function HeaderContent({ user }: { user: any }) {
    const router = useRouter();
    const { data: res, isLoading } = useMe();
    const isShowDevMode = false;
    useEffect(() => {
        if (user === null || user === undefined) {
            user = res?.data;
        }
    }, [res]);

    // const user = res?.data;
    // const [queryClient] = useState(() => {
    //     const client = new QueryClient();
    //     client.setQueryData(
    //         ["me"],
    //         user ?? null
    //     );

    //     return client;
    // });

    const { mutate: logout } = useLogout()
    const productInCart = useCartStore(state => state.productItems);
    const [showCart, setShowCart] = useState(false);
    const [searchText, setSearchText] = useState("");

    const [isOpenNotif, setIsOpenNotif] = useState(false);
    const { data: countRes } = useNotificationUnreadCount(!!user);
    const unreadCount = countRes?.count || 0;

    const { data: notifRes } = useNotifications(1, 20, !!user && isOpenNotif);
    const notifications = notifRes?.data || [];

    const { mutate: markRead } = useMarkNotificationRead();
    const { mutate: markAllRead } = useMarkAllNotificationsRead();

    const handleNotificationItemClick = (notif: any) => {
        if (!notif.isRead) {
            markRead(notif.id);
        }
        if (notif.type === 'order') {
            router.push('/user/orders');
        }
        setIsOpenNotif(false);
    };

    const handleSearch = () => {
        router.push(`/search?keyword=${searchText}`)
    }
    const handleCartClick = () => {
        router.push("/cart");
    }

    // useEffect(() => {
    //     setUser(props.user);
    // }, [props.user]);
    // useEffect(() => {
    //     if (data) {
    //         setUser(data);
    //     }
    // }, [data]);

    const handleLogout = async () => {
        await logout();
        // user = null;
        // setUser(null);
    }

    return (
        <header className=''>
            <div className='flex flex-col fixed top-0 w-full z-30'>
                {isShowDevMode && <div className='w-full! mx-0! text-center text-white bg-red-500'>Dev Mode</div>}
                <NavigationMenu className=' px-4 py-2 lg:px-20 w-full! max-w-none! justify-between gap-5 dark/30 border-b z-30 backdrop-blur'>
                    <Link href={'/'}><h1 className='font-bold text-2xl'>Emarket</h1></Link>
                    <div className='relative flex items-center w-full md:max-w-100 lg:max-w-150'>
                        <Input 
                            className='w-full bg-white pr-10' 
                            placeholder='Tìm kiếm sản phẩm' 
                            value={searchText} 
                            onChange={(e) => setSearchText(e.target.value)} 
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />
                        <Button 
                            type="button"
                            variant="ghost" 
                            size="icon"
                            onClick={handleSearch}
                            className='absolute right-1 h-8 w-8 text-gray-500 hover:text-primary dark:text-gray-400'
                        >
                            <FaSearch className='h-4 w-4' />
                        </Button>
                    </div>
                    <NavigationMenuList className=''>
                        <NavigationMenuItem className='ml-auto'>
                            <div className='flex gap-1'>
                                <ModeToggle />
                                <div onMouseLeave={() => setShowCart(false)} className='relative ' onMouseEnter={() => setShowCart(true)} >
                                    <Button variant="outline" onClick={() => handleCartClick()}><FaShoppingCart /><span className='absolute bg-red-500 right-1 -top-1 text-white rounded-full w-5'>{productInCart.length || 0}</span>
                                    </Button>
                                    {showCart &&
                                        <div className='absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50' >
                                            <div className='py-2'></div>
                                            <CartPopup />
                                        </div>}


                                </div>

                                {user && (
                                    <Popover open={isOpenNotif} onOpenChange={setIsOpenNotif}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className="relative">
                                                <Bell className="h-4 w-4" />
                                                {unreadCount > 0 && (
                                                    <span className="absolute bg-red-500 -top-1.5 -right-1.5 text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                                        {unreadCount > 99 ? '99+' : unreadCount}
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="end">
                                            <div className="p-3 border-b flex items-center justify-between">
                                                <h4 className="font-semibold text-sm">Thông báo</h4>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={() => markAllRead()}
                                                        className="text-xs text-primary hover:underline font-medium transition-colors cursor-pointer"
                                                    >
                                                        Đọc tất cả
                                                    </button>
                                                )}
                                            </div>
                                            <ScrollArea className="h-72">
                                                {notifications.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-1 p-4">
                                                        <Bell className="h-8 w-8 opacity-20" />
                                                        <p className="text-xs">Không có thông báo nào</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        {notifications.map((notif: any) => (
                                                            <div
                                                                key={notif.id}
                                                                onClick={() => handleNotificationItemClick(notif)}
                                                                className={`p-3 text-left border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors flex flex-col gap-1 ${
                                                                    !notif.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : 'pl-3.5'
                                                                }`}
                                                            >
                                                                <span className="font-semibold text-xs text-foreground">{notif.title}</span>
                                                                {notif.message && (
                                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                                        {notif.message}
                                                                    </p>
                                                                )}
                                                                <span className="text-[9px] text-muted-foreground/80 mt-1">
                                                                    {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                )}

                                {user ? (
                                    // <Button onClick={() => handleLogout()}>Đăng xuất {user.name}</Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <Avatar>
                                                    <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
                                                    <AvatarFallback>CN</AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-32">
                                            <DropdownMenuLabel>
                                                {user.name}
                                            </DropdownMenuLabel>
                                            <DropdownMenuGroup>
                                                {
                                                    user.role === 'admin' && <DropdownMenuItem><Link href={'/admin/dashboard'}>Bảng điều khiển</Link></DropdownMenuItem>
                                                }
                                                <>
                                                    <DropdownMenuItem><Link href={'/user/profile'}>Thông tin tài khoản</Link></DropdownMenuItem>
                                                    <DropdownMenuItem><Link href={'/user/orders'}>Đơn hàng</Link></DropdownMenuItem>
                                                </>
                                                {
                                                    user.role === 'user' && (
                                                        <>

                                                            <DropdownMenuItem><Link href={'/seller/setup-shop'}>Đăng ký gian hàng</Link></DropdownMenuItem>
                                                        </>
                                                    )
                                                }

                                                {
                                                    user.role === 'seller' && (
                                                        <>
                                                            <DropdownMenuItem><Link href={'/seller/dashboard/products-manager'}>Quản lý sản phẩm</Link></DropdownMenuItem>
                                                            <DropdownMenuItem><Link href={'/seller/dashboard/orders-manager'}>Đơn hàng của tôi</Link></DropdownMenuItem>
                                                        </>
                                                    )
                                                }
                                            </DropdownMenuGroup>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem variant='destructive' onClick={() => handleLogout()}>Đăng xuất</DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <>
                                        <Link href={"/login"}><Button>Đăng nhập</Button></Link>
                                        <Link href={"/register"}><Button variant="outline">Đăng ký</Button></Link>
                                    </>
                                )}




                            </div>

                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    )
}
