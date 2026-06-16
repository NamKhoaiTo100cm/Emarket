"use client";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviewService } from "@/services/review.service";
import Image from "next/image";
import { Star, MessageSquareDot } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SellerReviewsManagerPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<string>("");
    const [submittingId, setSubmittingId] = useState<number | null>(null);
    const [starFilter, setStarFilter] = useState<string>("all");

    const filteredReviews = reviews.filter((review) => {
        if (starFilter === "all") return true;
        return Number(review.rating) === Number(starFilter);
    });

    const loadReviews = () => {
        setLoading(true);
        reviewService.getSellerReviews()
            .then((res) => {
                setReviews(res.data ?? []);
            })
            .catch((err) => {
                console.error("Lỗi khi tải đánh giá:", err);
                toast.error("Không thể tải danh sách đánh giá");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleSendReply = async (reviewId: number) => {
        if (!replyText.trim()) {
            toast.warning("Vui lòng nhập nội dung phản hồi");
            return;
        }
        setSubmittingId(reviewId);
        try {
            await reviewService.sellerReplyReview(reviewId, replyText.trim());
            toast.success("Gửi phản hồi thành công!");
            setReplyingId(null);
            setReplyText("");
            loadReviews(); // reload to get the updated reply
        } catch (error: any) {
            toast.error(error.message || "Không thể gửi phản hồi");
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquareDot className="size-6 text-primary" />
                    Quản lý đánh giá
                    <span className="text-sm font-normal text-muted-foreground">
                        {starFilter === "all" ? `(${reviews.length} đánh giá)` : `(Tìm thấy ${filteredReviews.length} / ${reviews.length} đánh giá)`}
                    </span>
                </h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-muted-foreground shrink-0">Lọc theo số sao:</span>
                    <div className="w-[150px]">
                        <Select value={starFilter} onValueChange={setStarFilter}>
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="5">5 sao</SelectItem>
                                <SelectItem value="4">4 sao</SelectItem>
                                <SelectItem value="3">3 sao</SelectItem>
                                <SelectItem value="2">2 sao</SelectItem>
                                <SelectItem value="1">1 sao</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border overflow-hidden bg-background">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[30%]">Đánh giá của khách</TableHead>
                            <TableHead className="w-[15%]">Số sao</TableHead>
                            <TableHead className="w-[20%]">Khách hàng</TableHead>
                            <TableHead className="w-[20%]">Sản phẩm</TableHead>
                            <TableHead className="w-[15%]">Ngày tạo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Đang tải đánh giá...
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Cửa hàng của bạn chưa nhận được đánh giá nào.
                                </TableCell>
                            </TableRow>
                        ) : filteredReviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Không có đánh giá nào {starFilter} sao.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredReviews.map((review) => (
                                <TableRow key={review.id} className="hover:bg-muted/10 items-start align-top">
                                    {/* Review content & reply block */}
                                    <TableCell className="py-4 font-normal">
                                        <p className="text-sm text-foreground break-words max-w-[320px]">{review.comment}</p>

                                        {/* Review images preview */}
                                        {review.reviewImages && review.reviewImages.length > 0 && (
                                            <div className="flex gap-1.5 mt-2 flex-wrap">
                                                {review.reviewImages.map((img: string, idx: number) => (
                                                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="relative w-10 h-10 rounded border border-border overflow-hidden block hover:opacity-80 transition-opacity">
                                                        <Image src={img} alt="review-image" width={40} height={40} className="w-full h-full object-cover" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply section */}
                                        {replyingId === review.id ? (
                                            <div className="flex flex-col gap-2 mt-3 max-w-[280px]">
                                                <Textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Nhập phản hồi của shop..."
                                                    className="text-xs min-h-[60px]"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-xs px-2.5"
                                                        onClick={() => handleSendReply(review.id)}
                                                        disabled={submittingId === review.id || !replyText.trim()}
                                                    >
                                                        {submittingId === review.id ? "Đang gửi..." : "Gửi"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs px-2.5"
                                                        onClick={() => {
                                                            setReplyingId(null);
                                                            setReplyText("");
                                                        }}
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : review.sellerReply ? (
                                            <div className="mt-3 text-xs bg-muted/50 p-2.5 rounded border border-border max-w-[280px]">
                                                <div className="flex justify-between items-center font-semibold text-primary mb-1">
                                                    <span>Phản hồi của shop</span>
                                                    <button
                                                        onClick={() => {
                                                            setReplyingId(review.id);
                                                            setReplyText(review.sellerReply);
                                                        }}
                                                        className="text-primary hover:underline text-[10px] font-normal"
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                </div>
                                                <p className="text-muted-foreground italic">"{review.sellerReply}"</p>
                                                {review.sellerReplyAt && (
                                                    <p className="text-[9px] text-muted-foreground mt-1">
                                                        {new Date(review.sellerReplyAt).toLocaleString("vi-VN")}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-3 text-xs h-6 px-2"
                                                onClick={() => {
                                                    setReplyingId(review.id);
                                                    setReplyText("");
                                                }}
                                            >
                                                Trả lời
                                            </Button>
                                        )}
                                    </TableCell>

                                    {/* Star rating */}
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`w-3.5 h-3.5 ${index < review.rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-muted-foreground/30"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </TableCell>

                                    {/* Customer profile */}
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="size-8">
                                                <AvatarImage src={review.user.avatar} />
                                                <AvatarFallback className="text-xs">{review.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium text-sm truncate max-w-[120px]">{review.user.name}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[120px]">{review.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Associated product */}
                                    <TableCell className="py-4">
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="font-medium text-sm line-clamp-2 max-w-[150px]" title={review.product.name}>
                                                {review.product.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                ID: #{review.product.id}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Created Date */}
                                    <TableCell className="py-4 text-sm text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
