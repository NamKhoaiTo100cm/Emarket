"use client"
import { chatService } from "@/services/chat.service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// app/user/chat/page.tsx ← không có [conversationId]
// Luôn redirect: ưu tiên conversation đầu tiên, fallback về CSKH (support)
export default function ChatPage() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const convRes = await chatService.getUserConversations();
                if (convRes.data?.length > 0) {
                    router.replace(`/user/chat/${convRes.data[0].id}`);
                    return;
                }

                // Không có conversation nào → tạo/lấy CSKH conversation rồi redirect
                const supportRes = await chatService.getOrCreateSupportConversation('user');
                router.replace(`/user/chat/${supportRes.data.id}`);
            } catch {
                // Nếu lỗi, vẫn thử tạo support conversation
                try {
                    const supportRes = await chatService.getOrCreateSupportConversation('user');
                    router.replace(`/user/chat/${supportRes.data.id}`);
                } catch {
                    // ignore
                }
            }
        })();
    }, []);

    return (
        <div className="flex h-full items-center justify-center text-muted-foreground text-sm p-8">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Đang tải chat...</span>
            </div>
        </div>
    );
}