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
