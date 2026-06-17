'use client'

import { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { chatService } from '@/services/chat.service';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useMe } from '@/components/hooks/useAuth';
import { useMyShop } from '../hooks/useShop';

// ===================== TYPES =====================

interface Message {
    id: number;
    senderId: number;
    senderRole: 'user' | 'seller' | 'admin' | 'staff';
    content: string;
    createdAt: string;
}

interface Conversation {
    id: number;
    shopId: number | null;
    type?: string;
    shop?: { name: string; logo: string };
    user?: { name: string; avatar: string };
    lastMessage?: string;
    messages?: Message[];
}

type Role = 'user' | 'shop' | 'staff';

// ===================== SUB COMPONENTS =====================

function ConvCard({
    selected,
    label,
    avatar,
    fallback,
    lastMessage,
    onClick,
}: {
    selected: boolean;
    label: string;
    avatar?: string;
    fallback?: string;
    lastMessage?: string;
    onClick: () => void;
}) {
    return (
        <Card
            className={`flex mb-2 flex-row gap-3 items-center p-3 cursor-pointer hover:bg-muted transition-colors ${selected ? 'border border-primary' : ''}`}
            onClick={onClick}
        >
            <Avatar>
                <AvatarImage src={avatar} />
                <AvatarFallback>{fallback ?? '?'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
                <p className="font-semibold text-sm truncate">{label}</p>
                <p className="text-muted-foreground text-xs truncate">{lastMessage || 'Bắt đầu cuộc trò chuyện'}</p>
            </div>
        </Card>
    );
}

// ===================== ROUTE HELPER =====================

function getConvRoute(role: Role, id: number) {
    if (role === 'user') return `/user/chat/${id}`;
    if (role === 'shop') return `/seller/dashboard/chat/${id}`;
    return `/staff/dashboard/chat-support/${id}`;
}

// ===================== MAIN COMPONENT =====================

export default function ChatLayout({ role }: { role: Role }) {
    const { data: resUser } = useMe();
    const resShop = useMyShop(role === 'shop' ? (resUser?.data?.id ?? 0) : 0);

    const userId = resUser?.data?.id;
    const senderRole = role === 'shop' ? 'seller' : role;

    const router = useRouter();
    const { conversationId } = useParams();
    const selectedChatId = Number(conversationId || 0);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [supportConv, setSupportConv] = useState<Conversation | null>(null);
    const [connected, setConnected] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    const currentConversation = useMemo(
        () => conversations.find((c) => c.id === selectedChatId),
        [conversations, selectedChatId]
    );

    // ── Fetch supportConv ngay khi mount, không cần selectedChatId ──
    useEffect(() => {
        if (role === 'staff') return;

        (async () => {
            try {
                const supportRes = await chatService.getOrCreateSupportConversation(
                    role === 'user' ? 'user' : 'shop'
                );
                setSupportConv(supportRes.data);
                setConversations((prev) => {
                    const exists = prev.some((c) => c.id === supportRes.data.id);
                    return exists ? prev : [supportRes.data, ...prev];
                });
            } catch (err: any) {
                if (err?.message?.includes('đã tồn tại')) {
                    const supportRes = await chatService.getOrCreateSupportConversation(
                        role === 'user' ? 'user' : 'shop'
                    );
                    setSupportConv(supportRes.data);
                    setConversations((prev) => {
                        const exists = prev.some((c) => c.id === supportRes.data.id);
                        return exists ? prev : [supportRes.data, ...prev];
                    });
                }
            }
        })();
    }, [role]);

    // ── Fetch conversations + messages ──
    useEffect(() => {
        if (!selectedChatId) return;

        (async () => {
            if (role === 'staff') {
                const res = await chatService.getSupportConversationsAll();
                setConversations(res.data);
            } else {
                const convRes = await (role === 'user'
                    ? chatService.getUserConversations()
                    : chatService.getSellerConversations());
                setConversations((prev) => {
                    const support = prev.filter((c) => c.type === 'staff');
                    const fresh = convRes.data.filter((c: Conversation) =>
                        !support.some((s) => s.id === c.id)
                    );
                    return [...support, ...fresh];
                });
            }

            const msgRes = await chatService.getMessages(selectedChatId);
            setMessages(msgRes.data);
        })();
    }, [selectedChatId, role]);

    // ── Socket ──
    useEffect(() => {
        if (!userId) return;

        const socket = io(`${process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000'}/chat`, {
            auth: { userId },
            withCredentials: true,
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            setConnected(true);
            if (selectedChatId) {
                socket.emit('join_conversation', selectedChatId);
            }
        });
        socket.on('disconnect', () => setConnected(false));
        socket.on('new_message', (data: Message) => {
            setMessages((prev) =>
                prev.some((m) => m.id === data.id) ? prev : [...prev, data]
            );
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [userId, selectedChatId]);

    // ── Send ──
    const handleSend = () => {
        if (!socketRef.current || !message.trim()) return;
        socketRef.current.emit('send_message', {
            conversationId: selectedChatId,
            senderId: userId,
            senderRole,
            content: message,
        });
        setMessage('');
    };

    // ── Header label ──
    const headerLabel = useMemo(() => {
        if (!currentConversation) return '';
        if (currentConversation.type === 'staff') {
            return role === 'staff'
                ? (currentConversation.shop?.name ?? currentConversation.user?.name ?? 'CSKH')
                : 'CSKH';
        }
        return role === 'user'
            ? currentConversation.shop?.name
            : currentConversation.user?.name;
    }, [currentConversation, role]);

    // ── Shop conversations (bỏ supportConv ra) ──
    const shopConversations = useMemo(
        () => conversations.filter((c) => c.id !== supportConv?.id && c.type !== 'staff'),
        [conversations, supportConv]
    );

    // ===================== RENDER =====================

    return (
        <div className="flex h-150">
            {/* SIDEBAR */}
            <div className="w-60 shrink-0 border-r flex flex-col">
                <div className="px-4 py-4 border-b">
                    <h1 className="text-xl font-bold">Chat</h1>
                </div>

                <ScrollArea className="flex-1">
                    {role !== 'staff' ? (
                        <div className="flex flex-col p-2 gap-1">
                            {/* Support conv */}
                            {supportConv && (
                                <ConvCard
                                    selected={selectedChatId === supportConv.id}
                                    label="CSKH"
                                    fallback="?"
                                    lastMessage={supportConv.messages?.[0]?.content}
                                    onClick={() => router.push(getConvRoute(role, supportConv.id))}
                                />
                            )}

                            <Separator className="my-1" />
                            <p className="text-xs font-semibold text-muted-foreground px-1 py-1">Các cuộc hội thoại</p>

                            {shopConversations.map((chat) => (
                                <ConvCard
                                    key={chat.id}
                                    selected={selectedChatId === chat.id}
                                    label={role === 'shop' ? chat.user?.name! : chat.shop?.name!}
                                    avatar={role === 'shop' ? chat.user?.avatar : chat.shop?.logo}
                                    fallback={role === 'shop' ? chat.user?.name?.[0] : chat.shop?.name?.[0]}
                                    lastMessage={chat.lastMessage}
                                    onClick={() => router.push(getConvRoute(role, chat.id))}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col p-2 gap-1">
                            {[
                                {
                                    label: 'Users đang chờ',
                                    filter: (c: Conversation) => c.shopId === null,
                                    nameKey: 'user' as const,
                                },
                                {
                                    label: 'Shops đang chờ',
                                    filter: (c: Conversation) => c.shopId !== null,
                                    nameKey: 'shop' as const,
                                },
                            ].map(({ label, filter, nameKey }, idx) => (
                                <div key={label}>
                                    {idx > 0 && <Separator className="my-1" />}
                                    <p className="text-xs font-semibold text-muted-foreground px-1 py-1">{label}</p>
                                    {conversations.filter(filter).map((chat) => (
                                        <ConvCard
                                            key={chat.id}
                                            selected={selectedChatId === chat.id}
                                            label={nameKey === 'user' ? chat.user?.name! : chat.shop?.name!}
                                            avatar={nameKey === 'user' ? chat.user?.avatar : chat.shop?.logo}
                                            fallback={nameKey === 'user' ? chat.user?.name?.[0] : chat.shop?.name?.[0]}
                                            lastMessage={chat.lastMessage}
                                            onClick={() => router.push(getConvRoute('staff', chat.id))}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* CHAT PANEL */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center gap-3 shrink-0">
                    <Avatar>
                        <AvatarFallback>{headerLabel?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{headerLabel}</p>
                        <p className="text-xs text-muted-foreground">{connected ? 'Online' : 'Offline'}</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                    <div className="flex flex-col gap-2">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderRole === senderRole ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.senderRole === senderRole
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-muted text-foreground rounded-bl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t flex gap-2 shrink-0">
                    <Input
                        placeholder="Nhập tin nhắn..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1"
                    />
                    <Button onClick={handleSend}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}