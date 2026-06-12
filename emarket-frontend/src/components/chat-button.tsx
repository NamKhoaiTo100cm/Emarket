// components/ChatButton.tsx
'use client';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { MessageCircleIcon, Store } from 'lucide-react';

export default function ChatButton({ shopId }: { shopId: number }) {
    const router = useRouter();
    const handleChat = async () => {
        const data = await apiFetch('/chat/conversation', {
            method: 'POST',
            body: JSON.stringify({ shopId }),
        });
        const conversationId = data.data?.id ?? data.id;
        router.push(`/user/chat/${conversationId}`);
    };

    return (
        <Button onClick={handleChat}>
            <MessageCircleIcon className="mr-2" />
            Chat với shop
        </Button>
    );
}