"use client";
import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviewService } from "@/services/review.service";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/date";

export default function ReviewsManagerPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    useEffect(() => {
        reviewService.getAll().then((res) => setReviews(res.data));
    }, []);
    return (
        <div className="">
            <div className="">
                <h1>Danh sách đánh giá</h1>
                <div className="">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableCell>Nội dung</TableCell>
                                <TableCell>Số sao</TableCell>
                                <TableCell>Người viết</TableCell>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell>Ngày tạo</TableCell>
                                <TableCell>Trạng thái</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reviews.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>{review.comment}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: review.rating }).map((_, index) => (
                                                <Star key={index} className="fill-yellow-400 text-yellow-400" />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar>
                                                <AvatarImage src={review.user.avatar} />
                                                <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{review.user.name}</span>
                                                <span className="text-sm text-muted-foreground">{review.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell className="flex items-center gap-2">
                                        <Image src={review.product.images[0] ? review.product.images[0].imagePath : "/vercel.svg"} alt={review.product.name} width={50} height={50} className="rounded-lg object-contain" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{review.product.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                                    {/* <TableCell>
                                        <Badge variant={review.isHidden ? 'destructive' : 'default'}>
                                            {review.isHidden ? 'Bị ẩn' : 'Hiển thị'}
                                        </Badge>
                                    </TableCell> */}
                                    <TableCell>
                                        <Select
                                            name="isHidden"
                                            value={review.isHidden.toString()}
                                            onValueChange={(value) => {
                                                reviewService.updateIsHiddenStatus(review.id, value === 'false' ? false : true).then(() => {
                                                    console.log("isHidden" + value)
                                                    setReviews(reviews.map((r) => r.id === review.id ? { ...r, isHidden: value } : r));
                                                    toast("Cập nhật trạng thái thành công");
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="false">Hiển thị</SelectItem>
                                                <SelectItem value="true">Bị ẩn</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    {/* <TableCell>
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
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}