// hooks/useChat.ts
'use client';
import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ChatMessage {
    id: number;
    conversationId: number;
    senderId: number;
    senderRole: 'user' | 'seller' | 'admin';
    content: string;
    attachmentUrl?: string;
    isRead: boolean;
    createdAt: string;
}

export function useChat(conversationId: number, userId: number) {
    const socketRef = useRef<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);

    // Thêm vào useChat.ts, trước useEffect socket
    useEffect(() => {
        apiFetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/conversation/${conversationId}/messages`)
            .then(r => r.json())
            .then(data => setMessages(data.data ?? data));
    }, [conversationId]);

    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`, {
            auth: { userId },
            withCredentials: true,
        });


        socket.on('connect', () => {
            setConnected(true);
            console.log('Joining room:', conversationId); // thêm dòng này

            socket.emit('join_conversation', conversationId);
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('new_message', (message: ChatMessage) => {
            console.log('Nhận được new_message:', message); // thêm dòng này

            setMessages(prev => {
                if (prev.some(msg => msg.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [conversationId, userId]);

    const sendMessage = (content: string, senderRole: 'user' | 'seller') => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('send_message', {
            conversationId,
            senderId: userId,
            senderRole,
            content,
        });
    };

    const markRead = (role: 'user' | 'seller') => {
        socketRef.current?.emit('mark_read', { conversationId, role });
    };

    return { messages, setMessages, sendMessage, markRead, connected };
}