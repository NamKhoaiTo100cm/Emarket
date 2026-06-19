"use client";
import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/services/user.sevice";
import { formatDate } from "@/lib/date";

export default function UserManagerPage() {
    const [users, setUsers] = useState<any[]>([]);
    useEffect(() => {
        userService.getAllUsers(['user', 'seller']).then((res) => setUsers(res.data));
    }, []);
    return (
        <div className="">
            <div className="">
                <h1>Danh sách người dùng</h1>
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>Tên shop</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Số điện thoại</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Trạng thái</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone}</TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    <TableCell>
                                        <Select
                                            name="status"
                                            value={user.status}
                                            onValueChange={(value) => {
                                                userService.updateStatus(user.id, value as 'active' | 'banned').then(() => {
                                                    setUsers(users.map((u) => u.id === user.id ? { ...u, status: value as 'active' | 'banned' } : u));
                                                    toast("Cập nhật trạng thái thành công");
                                                }).catch((error) => {
                                                    toast(error.message);
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="banned">Banned</SelectItem>
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