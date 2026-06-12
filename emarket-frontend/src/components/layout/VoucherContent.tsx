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
import { FileUp, PlusIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";

export default function VoucherContent({ role }: { role: 'admin' | 'seller' }) {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
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
    useEffect(() => {
        if (role === 'admin') {
            voucherService.getAllVouchers().then((res) => setVouchers(res.data));
        } else {
            voucherService.getAllVouchers().then((res) => setVouchers(res.data));
        }
    }, []);
    const handleCreateVoucher = async () => {
        const data = {
            code: formData.code,
            discountType: formData.discountType,
            discountValue: formData.discountValue,
            minOrder: formData.minOrder,
            maxDiscount: formData.maxDiscount,
            expiresAt: formData.expiresAt,
            active: formData.active,

        };
        try {
            if (role === 'admin') {
                await voucherService.createPlatformVoucher(data);
            } else {
                await voucherService.createShopVoucher(data);
            }
            toast.success("Voucher created successfully");
            setOpen(false);
            voucherService.getAllVouchers().then((res: any) => setVouchers(res.data));
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
            toast.error(error.message);
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
                                        // onValueChange={(value) => {
                                        //     voucherService.updateStatus(voucher.id, value as 'active' | 'banned').then(() => {
                                        //         setUsers(users.map((u) => u.id === voucher.id ? { ...u, active: value as 'active' | 'banned' } : u));
                                        //         toast("Cập nhật trạng thái thành công");
                                        //     }).catch((error) => {
                                        //         toast(error.message);
                                        //     });
                                        // }}
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
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}