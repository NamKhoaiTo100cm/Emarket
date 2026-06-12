"use client"
import { chatService } from "@/services/chat.service";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// app/chat/page.tsx ← không có [conversationId]
export default function ChatPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        chatService.getUserConversations().then(res => {
            setConversations(res.data);
            // Tự động redirect vào conversation đầu tiên nếu có
            if (res.data?.length > 0) {
                router.replace(`/user/chat/${res.data[0].id}`);
            }
        });
    }, []);

    return <div>Đang tải...</div>
}