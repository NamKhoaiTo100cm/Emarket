"use client";
import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/ui/verified-badge";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
import { formatDate } from "@/lib/date";

export default function ShopManagerPage() {
    const [shops, setShops] = useState<any[]>([]);
    useEffect(() => {
        shopService.getAll().then((res) => setShops(res.data));
    }, []);
    return (
        <div className="">
            <div className="">
                <h1>Danh sách shop</h1>
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>Tên shop</TableCell>
                                <TableCell>Địa chỉ</TableCell>
                                <TableCell>Số điện thoại</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Tổng số sản phẩm</TableCell>
                                <TableCell>Xác thực</TableCell>
                                <TableCell>Trạng thái</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shops.map((shop) => (
                                <TableRow key={shop.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar>
                                                <AvatarImage src={shop.logo} />
                                                <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium">{shop.name}</span>
                                                    {shop.isVerified && <VerifiedBadge size="sm" />}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{shop.address}</TableCell>
                                    <TableCell>{shop.phone}</TableCell>
                                    <TableCell>{formatDate(shop.createdAt)}</TableCell>
                                    <TableCell>{shop.productCount}</TableCell>
                                    <TableCell>
                                        {shop.isVerified ? (
                                            <VerifiedBadge size="sm" showLabel />
                                        ) : shop.verificationStatus === "pending" ? (
                                            <Badge variant="secondary">Đang chờ</Badge>
                                        ) : (
                                            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                                <ShieldAlert size={13} />
                                                Chưa xác thực
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            name="status"
                                            value={shop.status}
                                            onValueChange={(value) => {
                                                shopService.updateStatus(shop.id, value === 'active' ? 'active' : 'banned').then(() => {
                                                    console.log("status" + value)
                                                    setShops(shops.map((s) => s.id === shop.id ? { ...s, status: value } : s));
                                                    toast("Cập nhật trạng thái thành công");
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