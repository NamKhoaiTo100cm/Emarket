"use client"
import { useMe } from "@/components/hooks/useAuth";
import { useMyShop } from "@/components/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shopService } from "@/services/shop.service";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Save, Phone, MapPin, AlignLeft, Info, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ShopProfilePage() {
    const { data: resUser } = useMe();
    const userId = resUser?.data?.id;
    const { data: resShop, isLoading: isShopLoading } = useMyShop(userId, !!userId);
    const shop = resShop?.data || null;

    const queryClient = useQueryClient();

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    // File upload states
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (shop) {
            setName(shop.name || "");
            setDescription(shop.description || "");
            setAddress(shop.address || "");
            setPhone(shop.phone || "");
            setLogoPreview(shop.logo || null);
            setBannerPreview(shop.banner || null);
        }
    }, [shop]);

    if (isShopLoading || !shop) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-2 text-slate-500">Đang tải thông tin cửa hàng...</p>
            </div>
        );
    }

    const handleLogoClick = () => {
        logoInputRef.current?.click();
    };

    const handleBannerClick = () => {
        bannerInputRef.current?.click();
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ảnh logo không được vượt quá 2MB");
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                toast.error("Ảnh bìa không được vượt quá 3MB");
                return;
            }
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Tên cửa hàng không được để trống");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("address", address);
            formData.append("phone", phone);

            if (logoFile) {
                formData.append("avatarImage", logoFile);
            }
            if (bannerFile) {
                formData.append("bannerImage", bannerFile);
            }

            const res = await shopService.updateProfile(formData);
            if (res.data) {
                toast.success("Cập nhật thông tin cửa hàng thành công");
                setLogoFile(null);
                setBannerFile(null);
                // Invalidate query to refetch updated data
                queryClient.invalidateQueries({ queryKey: ['my-shop', userId] });
            } else {
                toast.error(res.message || "Cập nhật cửa hàng thất bại");
            }
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            <Card className="shadow-xl border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 overflow-hidden">
                <form onSubmit={handleSave}>
                    {/* Banner Section */}
                    <div className="h-56 bg-slate-100 dark:bg-slate-800 relative group overflow-hidden">
                        {bannerPreview ? (
                            bannerPreview.startsWith("blob:") ? (
                                <Image
                                    src={bannerPreview}
                                    alt="shop banner preview"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    fill
                                />
                            ) : (
                                <Image
                                    src={bannerPreview}
                                    alt="shop banner"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            )
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center">
                                <span className="text-white font-medium text-lg opacity-85">Chưa có ảnh bìa</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" />
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={handleBannerClick}
                            disabled={loading}
                            className="absolute top-4 right-4 bg-white/95 text-slate-800 border border-slate-200 shadow-md hover:bg-slate-100 flex items-center gap-1.5 transition-all text-xs"
                        >
                            <Camera className="w-3.5 h-3.5" /> Thay đổi ảnh bìa
                        </Button>
                        <input
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    {/* Logo Overlay & Header Profile */}
                    <div className="px-6 md:px-8 pb-6 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 mb-4">
                            <div className="relative group cursor-pointer" onClick={handleLogoClick}>
                                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-950 overflow-hidden shadow-lg relative bg-white dark:bg-slate-900">
                                    {logoPreview?.startsWith("blob:") ? (
                                        <Image
                                            src={logoPreview}
                                            alt="shop logo preview"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={logoPreview || '/default-shop.png'}
                                            alt="shop logo"
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={logoInputRef}
                                onChange={handleLogoChange}
                                accept="image/*"
                                className="hidden"
                            />

                            <div className="flex flex-col items-center md:items-start text-center md:text-left mb-2">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {name || "Tên cửa hàng"}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Mã cửa hàng: #{shop.id}
                                </p>
                            </div>
                        </div>

                        {/* Editable Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Field className="flex flex-col gap-1.5">
                                <Label htmlFor="shopName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Tên cửa hàng
                                </Label>
                                <Input
                                    id="shopName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên cửa hàng của bạn"
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5">
                                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại cửa hàng
                                </Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại liên hệ"
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5 md:col-span-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <AlignLeft className="w-3.5 h-3.5 text-slate-400" /> Mô tả cửa hàng
                                </Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Giới thiệu đôi nét về shop của bạn..."
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5 md:col-span-2">
                                <Label htmlFor="address" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ cửa hàng
                                </Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Nhập địa chỉ giao dịch của cửa hàng"
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-slate-400" /> Trạng thái kiểm duyệt
                                </Label>
                                <div className="py-2.5 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800 text-sm font-medium">
                                    {shop.verificationStatus === "approved" ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">Đã xác minh ✓</span>
                                    ) : shop.verificationStatus === "pending" ? (
                                        <span className="text-amber-600 dark:text-amber-400">Đang kiểm duyệt...</span>
                                    ) : (
                                        <span className="text-slate-500">Chưa xác minh</span>
                                    )}
                                </div>
                            </Field>

                            <Field className="flex flex-col gap-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Ngày tạo
                                </Label>
                                <Input
                                    value={new Date(shop.createdAt).toLocaleDateString("vi-VN", { day: 'numeric', month: 'long', year: 'numeric' })}
                                    disabled
                                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                />
                            </Field>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 shadow-md transition-all duration-300 hover:shadow-lg"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );
}