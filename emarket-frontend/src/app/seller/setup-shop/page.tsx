"use client"
import { registerAction } from "@/actions/auth.action"
import ImageUpload from "@/components/file-upload-dropzone-4"
import Example from "@/components/file-upload-dropzone-4"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { authService } from "@/services/auth.service"
import { shopService } from "@/services/shop.service"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"

const SetupShopPage = () => {
    const [state, action, isPending] = useActionState(registerAction, null);
    const [shopName, setShopName] = useState('');
    const [shopDescription, setShopDescription] = useState('');
    const [shopAddress, setShopAddress] = useState('');
    const [shopPhone, setShopPhone] = useState('');
    const [shopAvatarFile, setShopAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [shopBannerFile, setShopBannerFile] = useState<File | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);
    const [isCreatingShop, setIsCreatingShop] = useState(false);
    const router = useRouter();

    const shop = {
        name: shopName,
        description: shopDescription,
        address: shopAddress,
        phone: shopPhone,
        bannerImage: shopBannerFile,
        avatarImage: shopAvatarFile,
    }
    useEffect(() => {
        if (state?.error) {
            alert(state.error)
        }
    }, [state])

    useEffect(() => {
        return () => {
            if (previewAvatar) URL.revokeObjectURL(previewAvatar);
        };
    }, [previewAvatar]);

    const handleCreateShop = async (e: React.FormEvent) => {
        const formData = new FormData();
        formData.append("name", shopName);
        formData.append("description", shopDescription);
        formData.append("address", shopAddress);
        formData.append("phone", shopPhone);
        if (shopAvatarFile) formData.append("avatarImage", shopAvatarFile);
        if (shopBannerFile) formData.append("bannerImage", shopBannerFile);
        setIsCreatingShop(true);
        const res = await shopService.create(formData);
        if (res) {
            await authService.refresh();
            router.push('/seller/dashboard/products-manager');
            router.refresh();
        }
        setIsCreatingShop(false);
    };



    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Tạo shop của bạn</CardTitle>
                    <CardDescription>
                        Nhập thông tin dưới đây để tạo shop của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateShop}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name" >Tên Shop của bạn</FieldLabel>
                                <Input id="name" name="name" type="text" placeholder="Tên Shop" onChange={(e) => setShopName(e.target.value)} required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="description">Mô tả Shop</FieldLabel>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Mô tả shop"
                                    rows={5}
                                    onChange={(e) => setShopDescription(e.target.value)}
                                    required
                                />
                            </Field>
                            <Field>
                                <Field className="">
                                    <Field>
                                        <FieldLabel htmlFor="address">Địa chỉ shop</FieldLabel>
                                        <Input id="address" name="address" type="text" placeholder="Địa chỉ shop" onChange={(e) => setShopAddress(e.target.value)} required />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="phone">
                                            Số điện thoại
                                        </FieldLabel>
                                        <Input id="phone" name="phone" type="text" placeholder="Số điện thoại" onChange={(e) => setShopPhone(e.target.value)} required />
                                    </Field>
                                </Field>
                                <FieldDescription>
                                    Thông tin cần thiết
                                </FieldDescription>
                            </Field>

                            {/* select avatar and banner */}
                            <div className="flex gap-4 justify-around">
                                <div className="flex flex-col items-center gap-2">
                                    <FieldLabel htmlFor="avatar">Ảnh đại diện Shop</FieldLabel>
                                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                                        <Image
                                            src={previewAvatar || "/shop-default-icon.svg"}
                                            alt="avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <Button type="button" onClick={() => document.getElementById('avatar')?.click()}>Chọn ảnh đại diện

                                    </Button>
                                    <Input type="file" id="avatar" name="avatar" accept="image/*" onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setShopAvatarFile(e.target.files[0])
                                            setPreviewAvatar(URL.createObjectURL(e.target.files[0]))
                                        }
                                    }} className="hidden" />

                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <FieldLabel htmlFor="banner">Ảnh banner Shop</FieldLabel>
                                    <div className="relative w-32 h-16 fit overflow-hidden">
                                        <Image
                                            src={previewBanner || "/shop-default-icon.svg"}
                                            alt="banner"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <Button type="button" onClick={() => document.getElementById('banner')?.click()}>Chọn ảnh banner</Button>
                                    <Input type="file" id="banner" name="banner" accept="image/*" onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setShopBannerFile(e.target.files[0])
                                            setPreviewBanner(URL.createObjectURL(e.target.files[0]))
                                        }
                                    }} className="hidden" />
                                </div>


                            </div>

                            <Field>
                                <Button type="button" className={cn("cursor-pointer", isCreatingShop && "cursor-not-allowed")} disabled={isCreatingShop} onClick={handleCreateShop}>
                                    {isCreatingShop ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tạo Shop"}
                                </Button>
                                <FieldDescription className="text-center">

                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}

export default SetupShopPage