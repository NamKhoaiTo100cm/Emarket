"use client"
import { chatService } from "@/services/chat.service";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const convRes = await chatService.getSellerConversations();
                if (convRes.data?.length > 0) {
                    router.replace(`/seller/dashboard/chat/${convRes.data[0].id}`);
                    return;
                }

                const supportRes = await chatService.getOrCreateSupportConversation('shop');
                router.replace(`/seller/dashboard/chat/${supportRes.data.id}`);
            } catch {
                const supportRes = await chatService.getOrCreateSupportConversation('shop');
                router.replace(`/seller/dashboard/chat/${supportRes.data.id}`);
            }
        })();
    }, []);

    return <div className="p-8 text-muted-foreground">Đang tải...</div>;
}