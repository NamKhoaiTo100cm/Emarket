"use client"
import { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/services/user.sevice";
import { toast } from "sonner";
import { Camera, Save, User as UserIcon } from "lucide-react";

export default function UserProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        try {
            const res = await userService.getProfile();
            if (res?.data) {
                const userData = res.data;
                setUser(userData);
                setName(userData.name || "");
                setPhone(userData.phone || "");
                setAddress(userData.address || "");
                setAvatarPreview(userData.avatar || null);
            }
        } catch (error: any) {
            toast.error("Không thể tải thông tin cá nhân");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB Limit
                toast.error("Kích thước ảnh không được vượt quá 2MB");
                return;
            }
            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Tên không được để trống");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("phone", phone);
            formData.append("address", address);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const res = await userService.updateProfile(formData);
            if (res.statusCode === 200 || res.id) {
                toast.success("Cập nhật thông tin cá nhân thành công");
                setAvatarFile(null);
                await loadData();
            } else {
                toast.error(res.message || "Cập nhật thất bại");
            }
        } catch (error: any) {
            toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
            <Card className="shadow-lg border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Thông Tin Cá Nhân
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <Avatar className="w-32 h-32 border-4 border-primary/10 group-hover:border-primary/30 transition-all duration-300 shadow-md">
                                    <AvatarImage src={avatarPreview || "https://github.com/shadcn.png"} className="object-cover" />
                                    <AvatarFallback className="bg-slate-100 text-slate-600">
                                        <UserIcon className="w-16 h-16" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAvatarClick}
                                className="text-xs flex items-center gap-2"
                            >
                                <Camera className="w-4 h-4" /> Thay ảnh đại diện
                            </Button>
                        </div>

                        {/* Fields Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field className="flex flex-col gap-1.5">
                                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Họ và Tên
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập họ và tên"
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5">
                                <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Số điện thoại
                                </Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5">
                                <Label htmlFor="balance" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Số dư tài khoản
                                </Label>
                                <Input
                                    id="balance"
                                    value={user?.balance ? `${Number(user.balance).toLocaleString("vi-VN")} đ` : "0 đ"}
                                    disabled
                                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-500 cursor-not-allowed font-semibold text-emerald-600 dark:text-emerald-400"
                                />
                            </Field>

                            <Field className="flex flex-col gap-1.5 md:col-span-2">
                                <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Địa chỉ giao hàng mặc định
                                </Label>
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Nhập địa chỉ của bạn"
                                    disabled={loading}
                                    className="w-full"
                                />
                            </Field>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}