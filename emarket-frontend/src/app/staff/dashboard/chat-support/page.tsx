"use client"
import { chatService } from "@/services/chat.service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Staff chat-support index page: redirect vào conversation phù hợp
export default function ChatSupportIndexPage() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                // Ưu tiên conversations đã assign cho mình
                const mineRes = await chatService.getMyAssignedConversations();
                if (mineRes.data?.length > 0) {
                    router.replace(`/staff/dashboard/chat-support/${mineRes.data[0].id}`);
                    return;
                }

                // Fallback: conversation chưa assign đầu tiên (để xem trước)
                const allRes = await chatService.getSupportConversationsAll();
                if (allRes.data?.length > 0) {
                    router.replace(`/staff/dashboard/chat-support/${allRes.data[0].id}`);
                }
                // Nếu không có gì cả thì giữ nguyên trang
            } catch {
                // ignore lỗi, giữ nguyên trang
            }
        })();
    }, []);

    return (
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm p-8">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Đang tải...</span>
            </div>
        </div>
    );
}