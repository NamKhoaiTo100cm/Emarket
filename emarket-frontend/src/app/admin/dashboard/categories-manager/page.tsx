"use client";
import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/services/user.sevice";
import categoryService from "@/services/category.service";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function CategoriesManagerPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({
        id: null,
        name: "",
        slug: "",
        icon: "",
        requiresVerification: false
    });
    useEffect(() => {
        categoryService.getAll().then((res) => setCategories(res.data));
    }, []);
    return (
        <div className="">
            <div className="">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-bold">Danh sách danh mục</h1>
                    <Button onClick={() => { setOpenAddEditDialog(true); setIsEdit(false); }}><PlusIcon />Thêm danh mục</Button>
                </div>
                <Dialog open={openAddEditDialog} onOpenChange={() => {
                    setOpenAddEditDialog(false);
                    setForm({ id: null, name: "", slug: "", icon: "", requiresVerification: false });
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
                            <DialogDescription>
                                Tên danh mục và slug không được trùng với danh mục đã có
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Field>
                                <Label htmlFor="name">Tên danh mục</Label>
                                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </Field>
                            <Field>
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                            </Field>
                            <Field>
                                <Label htmlFor="icon">Icon</Label>
                                <Input id="icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                            </Field>
                            <div className="flex flex-row items-center gap-2">
                                <Checkbox id="requiresVerification" checked={form.requiresVerification} onCheckedChange={(checked) => setForm({ ...form, requiresVerification: checked === true })} />
                                <Label htmlFor="requiresVerification">Yêu cầu shop xác minh</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" onClick={() => {
                                    setOpenAddEditDialog(false);
                                    setForm({ id: null, name: "", slug: "", icon: "", requiresVerification: false });
                                }}>
                                    Hủy
                                </Button>
                            </DialogClose>
                            <Button onClick={() => {
                                if (isEdit) {
                                    categoryService.update(form.id!, form).then(() => {
                                        setCategories(categories.map((category) => category.id === form.id ? form : category));
                                        setOpenAddEditDialog(false);
                                        setForm({ id: null, name: "", slug: "", icon: "", requiresVerification: false });
                                        toast("Cập nhật danh mục thành công");
                                    }).catch((error: any) => {
                                        toast(error.message);
                                    });
                                } else {
                                    categoryService.create(form).then(() => {
                                        setCategories([...categories, form]);
                                        setOpenAddEditDialog(false);
                                        setForm({ id: null, name: "", slug: "", icon: "", requiresVerification: false });
                                        toast("Thêm danh mục thành công");
                                    }).catch((error: any) => {
                                        toast(error.message);
                                    });
                                }
                            }}>{isEdit ? "Cập nhật" : "Thêm"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Tên danh mục</TableCell>
                                <TableCell>Slug</TableCell>
                                <TableCell>Icon</TableCell>
                                <TableCell>Cần shop xác minh</TableCell>
                                <TableCell>Thao tác</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* <Avatar>
                                                <AvatarImage src={category.icon} />
                                                <AvatarFallback>{category.name.charAt(0)}</AvatarFallback>
                                            </Avatar> */}
                                            <div>
                                                <span className="font-medium">{category.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>{category.icon}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={category.requiresVerification}
                                            disabled
                                            onCheckedChange={(checked) => {
                                                categoryService.update(category.id, { requiresVerification: checked })
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button
                                            onClick={() => {
                                                categoryService.delete(category.id).then(() => {
                                                    setCategories(categories.filter((c) => c.id !== category.id));
                                                    toast("Xóa danh mục thành công");
                                                }).catch((error) => {
                                                    toast(error.message);
                                                });
                                            }}
                                            variant="destructive"
                                        >
                                            Xóa
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setForm(category);
                                                setIsEdit(true);
                                                setOpenAddEditDialog(true);
                                            }}
                                        >Sửa</Button>
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