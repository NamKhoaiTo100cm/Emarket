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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";

export default function VoucherContent({ role }: { role: 'admin' | 'seller' }) {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        discountType: "",
        discountValue: "" as number | string,
        minOrder: "" as number | string,
        maxDiscount: "" as number | string,
        expiresAt: "",
        active: true,
        expiresAtInput: "",
        maxUses: "100" as number | string,
    });

    const [editFormData, setEditFormData] = useState({
        discountType: "",
        discountValue: "" as number | string,
        minOrder: "" as number | string,
        maxDiscount: "" as number | string,
        expiresAt: "",
        active: true,
        expiresAtInput: "",
        maxUses: "" as number | string,
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

    const handleCreateVoucher = async () => {
        const data = {
            code: formData.code,
            discountType: formData.discountType,
            discountValue: Number(formData.discountValue),
            minOrder: Number(formData.minOrder),
            maxDiscount: Number(formData.maxDiscount),
            expiresAt: formData.expiresAt || null,
            active: formData.active,
            maxUses: Number(formData.maxUses),
        };
        try {
            if (role === 'admin') {
                await voucherService.createPlatformVoucher(data);
            } else {
                await voucherService.createShopVoucher(data);
            }
            toast.success("Tạo voucher thành công!");
            setOpen(false);
            loadVouchers();
            setFormData({
                code: "",
                discountType: "",
                discountValue: 0,
                minOrder: 0,
                maxDiscount: 0,
                expiresAt: "",
                active: true,
                expiresAtInput: "",
                maxUses: 100,
            });
        } catch (error: any) {
            toast.error(error.message || "Không thể tạo voucher");
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

    const handleOpenEdit = (voucher: any) => {
        setEditingVoucherId(voucher.id);
        const formattedDate = voucher.expiresAt ? new Date(voucher.expiresAt).toISOString().split('T')[0] : "";
        setEditFormData({
            discountType: voucher.discountType || "",
            discountValue: voucher.discountValue || "",
            minOrder: voucher.minOrder || "",
            maxDiscount: voucher.maxDiscount || "",
            expiresAt: voucher.expiresAt || "",
            active: voucher.active,
            expiresAtInput: formattedDate,
            maxUses: voucher.maxUses || "",
        });
        setEditOpen(true);
    };

    const handleUpdateVoucher = async () => {
        if (!editingVoucherId) return;
        const data = {
            discountType: editFormData.discountType,
            discountValue: Number(editFormData.discountValue),
            minOrder: Number(editFormData.minOrder),
            maxDiscount: Number(editFormData.maxDiscount),
            expiresAt: editFormData.expiresAt || null,
            active: editFormData.active,
            maxUses: Number(editFormData.maxUses),
        };
        try {
            await voucherService.updateVoucher(editingVoucherId, data);
            toast.success("Cập nhật voucher thành công");
            setEditOpen(false);
            loadVouchers();
        } catch (error: any) {
            toast.error(error.message || "Không thể cập nhật voucher");
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
                    <Button onClick={() => { setOpen(true) }}><PlusIcon /> Tạo voucher</Button>
                    <Dialog
                        open={open}
                        onOpenChange={setOpen}
                    >

                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Tạo voucher mới</DialogTitle>
                                <DialogDescription>
                                    Tạo voucher mới để sử dụng
                                </DialogDescription>
                            </DialogHeader>
                            <form>
                                <div className="grid grid-cols-2 items-center gap-2">
                                    <Field className="flex-1">
                                        <Label htmlFor="code">Mã voucher</Label>
                                        <Input id="code" onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="discountType">Discount type</Label>
                                        <Select
                                            defaultValue={formData.discountType}
                                            onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Percentage</SelectItem>
                                                <SelectItem value="fixed">Fixed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="discountValue">Discount value</Label>
                                        <Input id="discountValue" value={formData.discountValue} type="number" onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="minOrder">Min order</Label>
                                        <Input id="minOrder" value={formData.minOrder} type="number" onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })} />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="maxDiscount">Max discount</Label>
                                        <Input id="maxDiscount" value={formData.maxDiscount} type="number" onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} />
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
                                                    expiresAt: raw ? `${raw}T00:00:00.000Z` : "",
                                                });
                                            }}
                                        />                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="">Trạng thái Kích hoạt</Label>
                                        <Select
                                            defaultValue={`${formData.active}`}
                                            onValueChange={(value) => setFormData({ ...formData, active: value === "true" })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Disable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="">Số lượng</Label>
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
                            <DialogFooter >
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={() => {
                                        setOpen(false);
                                        setFormData({
                                            code: "",
                                            discountType: "",
                                            discountValue: 0,
                                            minOrder: 0,
                                            maxDiscount: 0,
                                            expiresAt: "",
                                            active: true,
                                            expiresAtInput: "",
                                            maxUses: 100,
                                        });
                                    }}>Hủy</Button>
                                </DialogClose>
                                <Button type="submit" onClick={(e) => { handleCreateVoucher(); }}>Tạo voucher</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={editOpen}
                        onOpenChange={setEditOpen}
                    >
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Chỉnh sửa voucher</DialogTitle>
                                <DialogDescription>
                                    Cập nhật các thông tin của voucher
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdateVoucher(); }}>
                                <div className="grid grid-cols-2 items-center gap-2">
                                    <Field className="flex-1">
                                        <Label htmlFor="editDiscountType">Loại giảm giá</Label>
                                        <Select
                                            value={editFormData.discountType}
                                            onValueChange={(value) => setEditFormData({ ...editFormData, discountType: value })}
                                        >
                                            <SelectTrigger id="editDiscountType">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percent">Phần trăm</SelectItem>
                                                <SelectItem value="fixed">Số tiền cố định</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="editDiscountValue">Giá trị giảm</Label>
                                        <Input 
                                            id="editDiscountValue" 
                                            value={editFormData.discountValue} 
                                            type="number" 
                                            onChange={(e) => setEditFormData({ ...editFormData, discountValue: e.target.value })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="editMinOrder">Đơn hàng tối thiểu</Label>
                                        <Input 
                                            id="editMinOrder" 
                                            value={editFormData.minOrder} 
                                            type="number" 
                                            onChange={(e) => setEditFormData({ ...editFormData, minOrder: e.target.value })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="editMaxDiscount">Giảm tối đa</Label>
                                        <Input 
                                            id="editMaxDiscount" 
                                            value={editFormData.maxDiscount} 
                                            type="number" 
                                            onChange={(e) => setEditFormData({ ...editFormData, maxDiscount: e.target.value })} 
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="editExpiresAt">Ngày hết hạn</Label>
                                        <Input
                                            id="editExpiresAt"
                                            value={editFormData.expiresAtInput}
                                            type="date"
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                setEditFormData({
                                                    ...editFormData,
                                                    expiresAtInput: raw,
                                                    expiresAt: raw ? `${raw}T23:59:59.000Z` : "",
                                                });
                                            }}
                                        />
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="editActive">Trạng thái Kích hoạt</Label>
                                        <Select
                                            value={`${editFormData.active}`}
                                            onValueChange={(value) => setEditFormData({ ...editFormData, active: value === "true" })}
                                        >
                                            <SelectTrigger id="editActive">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Disable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field className="flex-1">
                                        <Label htmlFor="editQuantity">Số lượng</Label>
                                        <Input
                                            id="editQuantity"
                                            value={editFormData.maxUses}
                                            type="number"
                                            onChange={(e) => setEditFormData({ ...editFormData, maxUses: e.target.value })}
                                        />
                                    </Field>
                                </div>
                            </form>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
                                <Button type="submit" onClick={handleUpdateVoucher}>Lưu thay đổi</Button>
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
                                    <TableCell>{voucher.discountValue}</TableCell>
                                    {voucher.minOrder && <TableCell>{voucher.minOrder}</TableCell>}
                                    {voucher.maxDiscount && <TableCell>{voucher.maxDiscount}</TableCell>}
                                    <TableCell>{voucher.usedCount}</TableCell>
                                    <TableCell>{voucher.maxUses}</TableCell>
                                    <TableCell>{voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString() : "Không giới hạn"}</TableCell>
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