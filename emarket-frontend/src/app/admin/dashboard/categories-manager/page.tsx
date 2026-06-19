"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import categoryService from "@/services/category.service";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

export default function CategoriesManagerPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [openAddEditDialog, setOpenAddEditDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState<any>({
        id: null,
        name: "",
        slug: "",
        icon: "",
        requiresVerification: false,
        parentId: null
    });

    const resetForm = () => {
        setForm({
            id: null,
            name: "",
            slug: "",
            icon: "",
            requiresVerification: false,
            parentId: null
        });
    };

    const fetchCategories = () => {
        categoryService.getAll().then((res) => setCategories(res.data));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="">
            <div className="">
                <div className="flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-bold">Danh sách danh mục</h1>
                    <Button onClick={() => { resetForm(); setIsEdit(false); setOpenAddEditDialog(true); }}><PlusIcon />Thêm danh mục</Button>
                </div>
                <Dialog open={openAddEditDialog} onOpenChange={(open) => {
                    if (!open) {
                        setOpenAddEditDialog(false);
                        resetForm();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
                            <DialogDescription>
                                Tên danh mục và slug không được trùng với danh mục đã có.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
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
                            <Field>
                                <Label htmlFor="parentId">Danh mục cha</Label>
                                <Select
                                    value={form.parentId ? String(form.parentId) : "none"}
                                    onValueChange={(val) => setForm({ ...form, parentId: val === "none" ? null : Number(val) })}
                                >
                                    <SelectTrigger id="parentId">
                                        <SelectValue placeholder="Chọn danh mục cha" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                                        {categories
                                            .filter((c) => !isEdit || c.id !== form.id)
                                            .map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name} (ID: {c.id})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <div className="flex flex-row items-center gap-2 pt-2">
                                <Checkbox id="requiresVerification" checked={form.requiresVerification} onCheckedChange={(checked) => setForm({ ...form, requiresVerification: checked === true })} />
                                <Label htmlFor="requiresVerification" className="cursor-pointer">Yêu cầu shop xác minh</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" onClick={() => {
                                    setOpenAddEditDialog(false);
                                    resetForm();
                                }}>
                                    Hủy
                                </Button>
                            </DialogClose>
                            <Button onClick={() => {
                                const payload = {
                                    name: form.name,
                                    slug: form.slug,
                                    icon: form.icon,
                                    requiresVerification: form.requiresVerification,
                                    parentId: form.parentId
                                };

                                if (isEdit) {
                                    categoryService.update(form.id!, payload).then(() => {
                                        toast.success("Cập nhật danh mục thành công");
                                        setOpenAddEditDialog(false);
                                        resetForm();
                                        fetchCategories();
                                    }).catch((error: any) => {
                                        toast.error(error.message || "Không thể cập nhật danh mục");
                                    });
                                } else {
                                    categoryService.create(payload).then(() => {
                                        toast.success("Thêm danh mục thành công");
                                        setOpenAddEditDialog(false);
                                        resetForm();
                                        fetchCategories();
                                    }).catch((error: any) => {
                                        toast.error(error.message || "Không thể thêm danh mục");
                                    });
                                }
                            }}>{isEdit ? "Cập nhật" : "Thêm"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <div className="mt-4 border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell className="font-semibold">ID</TableCell>
                                <TableCell className="font-semibold">Tên danh mục</TableCell>
                                <TableCell className="font-semibold">Danh mục cha</TableCell>
                                <TableCell className="font-semibold">Slug</TableCell>
                                <TableCell className="font-semibold">Icon</TableCell>
                                <TableCell className="font-semibold text-center">Cần shop xác minh</TableCell>
                                <TableCell className="font-semibold text-right">Thao tác</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell>
                                        <span className="font-medium">{category.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        {category.parentId 
                                            ? categories.find((c) => c.id === category.parentId)?.name || `ID: ${category.parentId}`
                                            : <span className="text-muted-foreground">—</span>}
                                    </TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell>{category.icon}</TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={category.requiresVerification}
                                            disabled
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => {
                                                    setForm({
                                                        id: category.id,
                                                        name: category.name,
                                                        slug: category.slug,
                                                        icon: category.icon,
                                                        requiresVerification: category.requiresVerification,
                                                        parentId: category.parentId || null
                                                    });
                                                    setIsEdit(true);
                                                    setOpenAddEditDialog(true);
                                                }}
                                                size="sm"
                                            >
                                                Sửa
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
                                                        categoryService.delete(category.id).then(() => {
                                                            toast.success("Xóa danh mục thành công");
                                                            fetchCategories();
                                                        }).catch((error) => {
                                                            toast.error(error.message || "Không thể xóa danh mục");
                                                        });
                                                    }
                                                }}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                Xóa
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