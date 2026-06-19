"use client";

import { useEffect, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BadgeCheck, CheckCircle2, Clock, ImageIcon, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import Image from "next/image";
import { formatDateTime } from "@/lib/date";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "Chờ duyệt", variant: "default" },
    approved: { label: "Đã duyệt", variant: "outline" },
    rejected: { label: "Từ chối", variant: "destructive" },
};

export default function StaffVerificationsPage() {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedVerification, setSelectedVerification] = useState<any>(null);
    const [staffNote, setStaffNote] = useState("");
    const [reviewing, setReviewing] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    useEffect(() => {
        fetchVerifications(activeTab);
    }, [activeTab]);

    const fetchVerifications = async (status: string) => {
        setLoading(true);
        try {
            const res = await shopService.getVerifications(status);
            setVerifications(res.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (status: "approved" | "rejected") => {
        if (!selectedVerification) return;
        setReviewing(true);
        try {
            await shopService.reviewVerification(selectedVerification.id, { status, staffNote });
            toast.success(status === "approved" ? "✅ Đã duyệt xác thực thành công!" : "❌ Đã từ chối hồ sơ xác thực");
            setSelectedVerification(null);
            setStaffNote("");
            fetchVerifications(activeTab);
        } catch (e: any) {
            toast.error(e?.message ?? "Có lỗi xảy ra");
        } finally {
            setReviewing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="text-blue-500" />
                    Quản lý xác thực Shop
                </h1>
                <p className="text-muted-foreground mt-1">Xem xét và phê duyệt hồ sơ xác thực của các shop</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="pending" className="gap-2">
                        <Clock size={14} /> Chờ duyệt
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="gap-2">
                        <CheckCircle2 size={14} /> Đã duyệt
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="gap-2">
                        <XCircle size={14} /> Từ chối
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-48">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : verifications.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <ShieldAlert size={48} className="mb-4 opacity-30" />
                                <p className="text-lg font-medium">Không có hồ sơ nào</p>
                                <p className="text-sm mt-1">Không có yêu cầu xác thực nào ở trạng thái này</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {verifications.map((v) => (
                                <Card key={v.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                            {/* Shop info */}
                                            <div className="flex items-center gap-3 min-w-48">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={v.shop?.logo} />
                                                    <AvatarFallback>{v.shop?.name?.[0] ?? "S"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold">{v.shop?.name}</span>
                                                        {v.shop?.isVerified && (
                                                            <BadgeCheck size={16} className="fill-blue-500 text-white" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{v.shop?.phone}</p>
                                                    <p className="text-xs text-muted-foreground">{v.shop?.address}</p>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <Badge variant={statusConfig[v.status]?.variant}>
                                                        {statusConfig[v.status]?.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Nộp lúc: {formatDateTime(v.createdAt)}
                                                    </span>
                                                </div>

                                                {v.note && (
                                                    <div className="bg-muted/50 rounded-lg p-3 text-sm">
                                                        <span className="font-medium text-muted-foreground">Ghi chú seller: </span>
                                                        {v.note}
                                                    </div>
                                                )}

                                                {/* Documents */}
                                                {v.documents?.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-2 font-medium">
                                                            Tài liệu đính kèm ({v.documents.length} ảnh):
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {v.documents.map((doc: any) => (
                                                                <button
                                                                    key={doc.id}
                                                                    onClick={() => setViewingImage(doc.imagePath)}
                                                                    className="relative w-20 h-20 rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                                                >
                                                                    <Image src={doc.imagePath} alt="doc" fill className="object-cover" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {v.staffNote && (
                                                    <div className="bg-muted rounded-lg p-3 text-sm border-l-4 border-primary">
                                                        <span className="font-medium">Ghi chú staff: </span>
                                                        {v.staffNote}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {v.status === "pending" && (
                                                <div className="flex sm:flex-col gap-2 sm:min-w-28">
                                                    <Button

                                                        onClick={() => { setSelectedVerification(v); setStaffNote(""); }}
                                                    >
                                                        <BadgeCheck size={14} />
                                                        Duyệt / Từ chối
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialog xem xét */}
            <Dialog open={!!selectedVerification} onOpenChange={(o) => !o && setSelectedVerification(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="text-blue-500" size={20} />
                            Xem xét hồ sơ xác thực
                        </DialogTitle>
                        <DialogDescription>
                            Shop: <strong>{selectedVerification?.shop?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ghi chú cho seller (tùy chọn)</label>
                            <Textarea
                                placeholder="Nhập lý do duyệt/từ chối, yêu cầu bổ sung giấy tờ..."
                                value={staffNote}
                                onChange={e => setStaffNote(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => handleReview("rejected")}
                            disabled={reviewing}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <XCircle size={14} className="mr-1.5" />
                            Từ chối
                        </Button>
                        <Button
                            onClick={() => handleReview("approved")}
                            disabled={reviewing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {reviewing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1.5" />
                            ) : (
                                <BadgeCheck size={14} className="mr-1.5" />
                            )}
                            Phê duyệt xác thực
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image viewer */}
            <Dialog open={!!viewingImage} onOpenChange={(o) => !o && setViewingImage(null)}>
                <DialogContent className="max-w-3xl p-2">
                    {viewingImage && (
                        <div className="relative w-full aspect-[4/3]">
                            <Image src={viewingImage} alt="Document" fill className="object-contain rounded-lg" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
