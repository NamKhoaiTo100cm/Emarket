"use client"
import { chatService } from "@/services/chat.service";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// app/chat/page.tsx ← không có [conversationId]
export default function ChatPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        async function getConversations() {
            const response = await chatService.getSupportConversationsAll();
            console.log('get all support chat not assigned', response.data)
            setConversations(response.data);
            // Tự động redirect vào conversation đầu tiên nếu có
            if (response.data?.length > 0) {
                router.replace(`/staff/dashboard/chat-support/${response.data[0].id}`);
            }
        }
        getConversations();
    }, []);

    return <div>Đang tải...</div>
}