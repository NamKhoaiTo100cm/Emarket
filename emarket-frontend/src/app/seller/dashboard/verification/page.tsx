"use client";

import { useEffect, useRef, useState } from "react";
import { shopService } from "@/services/shop.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BadgeCheck, Clock, FileText, ImageIcon, ShieldAlert, ShieldCheck, Upload, X } from "lucide-react";
import Image from "next/image";
import { formatDateTime } from "@/lib/date";

const statusConfig = {
    none: { label: "Chưa xác thực", color: "secondary" as const, icon: ShieldAlert, desc: "Shop của bạn chưa được xác thực." },
    pending: { label: "Đang chờ duyệt", color: "default" as const, icon: Clock, desc: "Hồ sơ đang được staff xem xét." },
    approved: { label: "Đã xác thực", color: "default" as const, icon: ShieldCheck, desc: "Shop của bạn đã được xác thực thành công." },
    rejected: { label: "Bị từ chối", color: "destructive" as const, icon: ShieldAlert, desc: "Hồ sơ xác thực bị từ chối. Vui lòng nộp lại." },
};

export default function SellerVerificationPage() {
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [note, setNote] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const latestVerification = verifications[0];
    const currentStatus = latestVerification?.status ?? "none";
    const statusInfo = statusConfig[currentStatus as keyof typeof statusConfig];
    const StatusIcon = statusInfo.icon;

    const canSubmit = currentStatus === "none" || currentStatus === "rejected";

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        try {
            const res = await shopService.getMyVerification();
            setVerifications(res.data ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (selectedFiles.length + files.length > 10) {
            toast.error("Tối đa 10 ảnh");
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
        const urls = files.map(f => URL.createObjectURL(f));
        setPreviewUrls(prev => [...prev, ...urls]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            toast.error("Vui lòng upload ít nhất 1 ảnh giấy tờ");
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            if (note) formData.append("note", note);
            selectedFiles.forEach(f => formData.append("documents", f));
            await shopService.submitVerification(formData);
            toast.success("Nộp hồ sơ xác thực thành công! Staff sẽ xem xét trong vòng 24-48 giờ.");
            setNote("");
            setSelectedFiles([]);
            setPreviewUrls([]);
            fetchVerifications();
        } catch (e: any) {
            toast.error(e?.message ?? "Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldCheck className="text-blue-500" />
                    Xác thực Shop
                </h1>
                <p className="text-muted-foreground mt-1">
                    Xác thực shop giúp bạn bán được các mặt hàng yêu cầu giấy phép (Y tế, Dược phẩm...) và nhận badge tích xanh ✓
                </p>
            </div>

            {/* Trạng thái hiện tại */}
            <Card className={`border-2 ${currentStatus === "approved" ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : currentStatus === "rejected" ? "border-red-400 bg-red-50 dark:bg-red-950/20" : currentStatus === "pending" ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20" : "border-border"}`}>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className={`rounded-full p-3 ${currentStatus === "approved" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40" : currentStatus === "rejected" ? "bg-red-100 text-red-600" : currentStatus === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-muted text-muted-foreground"}`}>
                            <StatusIcon size={28} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-base">{statusInfo.label}</span>
                                {currentStatus === "approved" && (
                                    <BadgeCheck size={20} className="fill-blue-500 text-white" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{statusInfo.desc}</p>
                            {latestVerification?.staffNote && (
                                <div className="mt-2 p-2 bg-background rounded border text-sm">
                                    <span className="font-medium">Ghi chú từ staff: </span>
                                    {latestVerification.staffNote}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form nộp hồ sơ */}
            {canSubmit && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText size={18} />
                            Nộp hồ sơ xác thực
                        </CardTitle>
                        <CardDescription>
                            Upload giấy phép kinh doanh, giấy chứng nhận hoặc các tài liệu liên quan. Tối đa 10 ảnh.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Upload area */}
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
                            <p className="font-medium">Nhấn để chọn ảnh giấy tờ</p>
                            <p className="text-sm text-muted-foreground mt-1">JPG, PNG, PDF (tối đa 10 ảnh)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Previews */}
                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {previewUrls.map((url, i) => (
                                    <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                                        <Image src={url} alt={`doc-${i}`} fill className="object-cover" />
                                        <button
                                            onClick={() => removeFile(i)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Ghi chú */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
                            <Textarea
                                placeholder="Mô tả thêm về giấy tờ bạn đã upload, loại chứng chỉ, thời hạn hiệu lực..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={submitting || selectedFiles.length === 0}
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Đang nộp hồ sơ...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <ShieldCheck size={16} />
                                    Nộp hồ sơ xác thực
                                </span>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Lịch sử */}
            {verifications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Lịch sử xác thực</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {verifications.map((v) => {
                            const st = statusConfig[v.status as keyof typeof statusConfig];
                            return (
                                <div key={v.id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge variant={st.color}>{st.label}</Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTime(v.createdAt)}
                                        </span>
                                    </div>
                                    {v.note && <p className="text-sm text-muted-foreground">Ghi chú: {v.note}</p>}
                                    {v.staffNote && (
                                        <div className="bg-muted rounded p-2 text-sm">
                                            <span className="font-medium">Phản hồi staff: </span>{v.staffNote}
                                        </div>
                                    )}
                                    {v.documents?.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {v.documents.map((doc: any) => (
                                                <a key={doc.id} href={doc.imagePath} target="_blank" rel="noopener noreferrer">
                                                    <div className="relative aspect-square rounded overflow-hidden border hover:opacity-80 transition-opacity">
                                                        <Image src={doc.imagePath} alt="doc" fill className="object-cover" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
