"use client";
import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/services/user.sevice";
import { voucherService } from "@/services/voucher.service";
import { FileUp, PlusIcon, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { formatNumberString, parseFormattedString } from "@/lib/utils";
import { formatDate } from "@/lib/date";

export default function VoucherContent({ role }: { role: 'admin' | 'seller' }) {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        discountType: "percent",
        discountValue: "" as number | string,
        minOrder: "" as number | string,
        maxDiscount: "" as number | string,
        expiresAt: "",
        active: true,
        expiresAtInput: "",
        maxUses: "100" as number | string,
    });

    const loadVouchers = () => {
        voucherService.getAllVouchers()
            .then((res) => setVouchers(res?.data ?? []))
            .catch((err) => {
                console.error(err);
                toast.error("Không thể tải danh sách voucher");
            });
    };

    useEffect(() => {
        loadVouchers();
    }, []);

    const handleOpenCreate = () => {
        setEditingVoucherId(null);
        setFormData({
            code: "",
            discountType: "percent",
            discountValue: "",
            minOrder: "",
            maxDiscount: "",
            expiresAt: "",
            active: true,
            expiresAtInput: "",
            maxUses: "100",
        });
        setOpen(true);
    };

    const handleOpenEdit = (voucher: any) => {
        setEditingVoucherId(voucher.id);
        const formattedDate = voucher.expiresAt ? new Date(voucher.expiresAt).toISOString().split('T')[0] : "";
        setFormData({
            code: voucher.code || "",
            discountType: voucher.discountType || "percent",
            discountValue: voucher.discountValue !== undefined && voucher.discountValue !== null ? formatNumberString(voucher.discountValue) : "",
            minOrder: voucher.minOrder !== undefined && voucher.minOrder !== null ? formatNumberString(voucher.minOrder) : "",
            maxDiscount: voucher.maxDiscount !== undefined && voucher.maxDiscount !== null ? formatNumberString(voucher.maxDiscount) : "",
            expiresAt: voucher.expiresAt || "",
            active: voucher.active,
            expiresAtInput: formattedDate,
            maxUses: voucher.maxUses !== undefined && voucher.maxUses !== null ? String(voucher.maxUses) : "",
        });
        setOpen(true);
    };

    const handleSubmit = async () => {
        const valValue = parseFormattedString(String(formData.discountValue));
        const valMinOrder = parseFormattedString(String(formData.minOrder));
        const valMaxDiscount = parseFormattedString(String(formData.maxDiscount));

        const data = {
            code: formData.code,
            discountType: formData.discountType,
            discountValue: valValue ? Number(valValue) : 0,
            minOrder: valMinOrder ? Number(valMinOrder) : 0,
            maxDiscount: valMaxDiscount ? Number(valMaxDiscount) : 0,
            expiresAt: formData.expiresAt || null,
            active: formData.active,
            maxUses: Number(formData.maxUses || 0),
        };

        try {
            if (editingVoucherId === null) {
                if (role === 'admin') {
                    await voucherService.createPlatformVoucher(data);
                } else {
                    await voucherService.createShopVoucher(data);
                }
                toast.success("Tạo voucher thành công!");
            } else {
                await voucherService.updateVoucher(editingVoucherId, {
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    minOrder: data.minOrder,
                    maxDiscount: data.maxDiscount,
                    expiresAt: data.expiresAt,
                    active: data.active,
                    maxUses: data.maxUses,
                });
                toast.success("Cập nhật voucher thành công");
            }
            setOpen(false);
            loadVouchers();
            setFormData({
                code: "",
                discountType: "percent",
                discountValue: "",
                minOrder: "",
                maxDiscount: "",
                expiresAt: "",
                active: true,
                expiresAtInput: "",
                maxUses: "100",
            });
        } catch (error: any) {
            toast.error(error.message || "Không thể thực hiện thao tác");
        }
    };

    const handleToggleActive = async (voucherId: number, active: boolean) => {
        try {
            await voucherService.updateVoucher(voucherId, { active });
            toast.success("Cập nhật trạng thái thành công");
            loadVouchers();
        } catch (error: any) {
            toast.error(error.message || "Không thể cập nhật trạng thái");
        }
    };

    const handleDeleteVoucher = async (voucherId: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa/dừng kích hoạt voucher này không?")) {
            try {
                await voucherService.deleteVoucher(voucherId);
                toast.success("Thực hiện thao tác thành công");
                loadVouchers();
            } catch (error: any) {
                toast.error(error.message || "Không thể xóa voucher");
            }
        }
    };
    return (
        <div className="">
            <div className="">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Quản lý voucher</h1>
                    {role === 'seller' && (
                        <Button onClick={handleOpenCreate}><PlusIcon /> Tạo voucher</Button>
                    )}
                    <Dialog
                        open={open}
                        onOpenChange={setOpen}
                    >
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingVoucherId === null ? "Tạo voucher mới" : "Chỉnh sửa voucher"}</DialogTitle>
                                <DialogDescription>
                                    {editingVoucherId === null ? "Tạo voucher mới để sử dụng" : "Cập nhật các thông tin của voucher"}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                <div className="grid grid-cols-2 items-center gap-2">
                                    <Field className="flex-1">
                                        <Label htmlFor="code">Mã voucher</Label>
                                        <Input 
                                            id="code" 
                                            value={formData.code} 
                                            disabled={editingVoucherId !== null} 
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="discountType">Loại giảm giá</Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                                        >
                                            <SelectTrigger id="discountType">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Phần trăm</SelectItem>
                                                <SelectItem value="fixed">Số tiền cố định</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="discountValue">Giá trị giảm</Label>
                                        <Input 
                                            id="discountValue" 
                                            value={formData.discountValue} 
                                            onChange={(e) => setFormData({ ...formData, discountValue: formatNumberString(e.target.value) })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="minOrder">Đơn hàng tối thiểu</Label>
                                        <Input 
                                            id="minOrder" 
                                            value={formData.minOrder} 
                                            onChange={(e) => setFormData({ ...formData, minOrder: formatNumberString(e.target.value) })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="maxDiscount">Giảm tối đa</Label>
                                        <Input 
                                            id="maxDiscount" 
                                            value={formData.maxDiscount} 
                                            onChange={(e) => setFormData({ ...formData, maxDiscount: formatNumberString(e.target.value) })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="expiresAt">Ngày hết hạn</Label>
                                        <Input
                                            id="expiresAt"
                                            value={formData.expiresAtInput}
                                            type="date"
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    expiresAtInput: raw,
                                                    expiresAt: raw ? `${raw}T23:59:59.000Z` : "",
                                                });
                                            }}
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="active">Trạng thái Kích hoạt</Label>
                                        <Select
                                            value={`${formData.active}`}
                                            onValueChange={(value) => setFormData({ ...formData, active: value === "true" })}
                                        >
                                            <SelectTrigger id="active">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Disable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="quantity">Số lượng</Label>
                                        <Input
                                            id="quantity"
                                            value={formData.maxUses}
                                            type="number"
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    maxUses: raw ? Number(raw) : 0,
                                                });
                                            }}
                                        />
                                    </Field>
                                </div>
                            </form>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    setOpen(false);
                                    setEditingVoucherId(null);
                                    setFormData({
                                        code: "",
                                        discountType: "percent",
                                        discountValue: "",
                                        minOrder: "",
                                        maxDiscount: "",
                                        expiresAt: "",
                                        active: true,
                                        expiresAtInput: "",
                                        maxUses: "100",
                                    });
                                }}>Hủy</Button>
                                <Button type="submit" onClick={handleSubmit}>
                                    {editingVoucherId === null ? "Tạo voucher" : "Lưu thay đổi"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>Tên voucher</TableCell>
                                <TableCell>Phạm vi voucher</TableCell>
                                <TableCell>Loại voucher</TableCell>
                                <TableCell>Giá trị</TableCell>
                                <TableCell>Giá trị tối thiểu</TableCell>
                                <TableCell>Giá trị tối đa</TableCell>
                                <TableCell>Số lượng đã sử dụng</TableCell>
                                <TableCell>Tổng số lượng</TableCell>
                                <TableCell>Ngày hết hạn</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell className="text-right">Hành động</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vouchers.map((voucher) => (
                                <TableRow key={voucher.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <span className="font-medium">{voucher.code}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{voucher.scope === "platform" ? "Voucher toàn sàn" : "Voucher shop"}</TableCell>
                                    <TableCell>{voucher.discountType === "percent" ? "Phần trăm" : "Giá cố định"}</TableCell>
                                    <TableCell>
                                        {voucher.discountType === "percent" 
                                            ? `${voucher.discountValue}%` 
                                            : `${Number(voucher.discountValue).toLocaleString('vi-VN')}đ`}
                                    </TableCell>
                                    <TableCell>
                                        {voucher.minOrder 
                                            ? `${Number(voucher.minOrder).toLocaleString('vi-VN')}đ` 
                                            : "0đ"}
                                    </TableCell>
                                    <TableCell>
                                        {voucher.maxDiscount 
                                            ? `${Number(voucher.maxDiscount).toLocaleString('vi-VN')}đ` 
                                            : "Không giới hạn"}
                                    </TableCell>
                                    <TableCell>{voucher.usedCount}</TableCell>
                                    <TableCell>{voucher.maxUses}</TableCell>
                                    <TableCell>{voucher.expiresAt ? formatDate(voucher.expiresAt) : "Không giới hạn"}</TableCell>
                                    <TableCell>
                                        <Select
                                            name="status"
                                            value={voucher.active.toString()}
                                            onValueChange={(value) => handleToggleActive(voucher.id, value === "true")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Kích hoạt</SelectItem>
                                                <SelectItem value="false">Không kích hoạt</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-muted"
                                                onClick={() => handleOpenEdit(voucher)}
                                            >
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-muted"
                                                onClick={() => handleDeleteVoucher(voucher.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}