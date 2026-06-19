"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/services/user.sevice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogClose, 
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
    Search, 
    Plus, 
    Trash2, 
    UserCheck, 
    UserX, 
    Users, 
    ShieldAlert,
    Mail,
    Phone,
    Calendar,
    Loader2
} from "lucide-react";
import { formatDate } from "@/lib/date";

export default function StaffsManagerPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Create staff state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Delete staff state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any | null>(null);

    const fetchUsers = () => {
        setIsLoading(true);
        userService.getAllUsers(['staff'])
            .then((res) => {
                setUsers(res.data || []);
            })
            .catch((err) => {
                toast.error("Không thể tải danh sách nhân viên: " + err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Form validation
    const validateForm = () => {
        const tempErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            tempErrors.name = "Họ tên không được để trống";
        }
        if (!formData.email.trim()) {
            tempErrors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            tempErrors.email = "Email không hợp lệ";
        }
        if (!formData.password) {
            tempErrors.password = "Mật khẩu không được để trống";
        } else if (formData.password.length < 6) {
            tempErrors.password = "Mật khẩu phải từ 6 ký tự trở lên";
        }
        if (formData.phone && !/^(0|84)\d{7,11}$/.test(formData.phone)) {
            tempErrors.phone = "Số điện thoại không hợp lệ";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCreateStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        userService.createStaff(formData)
            .then(() => {
                toast.success("Tạo nhân viên mới thành công!");
                setIsCreateOpen(false);
                setFormData({ name: "", email: "", password: "", phone: "" });
                setErrors({});
                fetchUsers();
            })
            .catch((err) => {
                toast.error(err.message || "Tạo nhân viên thất bại");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleDeleteStaff = () => {
        if (!userToDelete) return;
        userService.deleteUser(userToDelete.id)
            .then(() => {
                toast.success(`Đã xóa nhân viên ${userToDelete.name}`);
                setIsDeleteOpen(false);
                setUserToDelete(null);
                fetchUsers();
            })
            .catch((err) => {
                toast.error("Xóa thất bại: " + err.message);
            });
    };

    const handleStatusChange = (userId: number, newStatus: 'active' | 'banned') => {
        userService.updateStatus(userId, newStatus)
            .then(() => {
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
                toast.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'khóa'} tài khoản nhân viên`);
            })
            .catch((err) => {
                toast.error("Cập nhật thất bại: " + err.message);
            });
    };

    // Filtering users
    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            (user.name || '').toLowerCase().includes(query) ||
            (user.email || '').toLowerCase().includes(query) ||
            (user.phone || '').toLowerCase().includes(query)
        );
    });

    const activeCount = users.filter(u => u.status === 'active').length;
    const bannedCount = users.filter(u => u.status === 'banned').length;

    return (
        <div className="space-y-6 p-1">
            {/* Header Area */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân viên</h1>
                    <p className="text-muted-foreground mt-1">
                        Xem, tạo mới, khóa tài khoản hoặc xóa nhân viên hệ thống.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 self-start md:self-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Thêm nhân viên mới
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-l-4 border-l-primary/70 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tổng nhân viên</p>
                            <h3 className="text-2xl font-bold">{users.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
                            <h3 className="text-2xl font-bold">{activeCount}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive/70 transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                            <UserX className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Đã khóa tài khoản</p>
                            <h3 className="text-2xl font-bold">{bannedCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <Card className="shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Danh sách nhân viên</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên, email hoặc SĐT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Table Area */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Nhân viên</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Số điện thoại</TableHead>
                                    <TableHead>Ngày tham gia</TableHead>
                                    <TableHead className="w-[150px]">Trạng thái</TableHead>
                                    <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span>Đang tải danh sách nhân viên...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Không tìm thấy nhân viên nào.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/40">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 ring-1 ring-border">
                                                        <AvatarImage src={user.avatar} alt={user.name} />
                                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                                            {(user.name || "S").charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-foreground">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">Mã số: #{user.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.phone ? (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                        <span>{user.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/50 text-xs italic">Chưa cập nhật</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    <span>{formatDate(user.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={user.status}
                                                    onValueChange={(val) => handleStatusChange(user.id, val as 'active' | 'banned')}
                                                >
                                                    <SelectTrigger className="w-[125px] h-8 text-xs font-medium">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                                <span>Hoạt động</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="banned" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-destructive" />
                                                                <span>Khóa</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        setUserToDelete(user);
                                                        setIsDeleteOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Staff Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Thêm nhân viên mới</DialogTitle>
                        <DialogDescription>
                            Tạo tài khoản nhân viên để hỗ trợ quản trị và điều hành hệ thống Emarket.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateStaff} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Họ tên nhân viên <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Nguyễn Văn A"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.name && (
                                <p className="text-xs font-medium text-destructive mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email đăng nhập <span className="text-destructive">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="staff@emarket.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-destructive mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu đăng nhập <span className="text-destructive">*</span></Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.password && (
                                <p className="text-xs font-medium text-destructive mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                placeholder="VD: 0987654321"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.phone && (
                                <p className="text-xs font-medium text-destructive mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Hủy bỏ</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                Tạo tài khoản
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5 w-5" />
                            Xác nhận xóa tài khoản
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-foreground">
                            Hành động này <strong className="text-destructive">không thể hoàn tác</strong>. 
                            Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên <strong>{userToDelete?.name}</strong> (Mã số #{userToDelete?.id}) khỏi hệ thống?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Không, giữ lại</Button>
                        </DialogClose>
                        <Button 
                            type="button" 
                            variant="destructive"
                            onClick={handleDeleteStaff}
                        >
                            Đồng ý xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}