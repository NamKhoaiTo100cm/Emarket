'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, UserCheck, UserX, Headphones } from 'lucide-react';
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
    assignedStaffId?: number | null;
    shop?: { name: string; logo: string };
    user?: { name: string; avatar: string };
    lastMessage?: string;
    messages?: Message[];
}

type Role = 'user' | 'shop' | 'staff';
type StaffTab = 'unassigned' | 'mine';

// ===================== SUB COMPONENTS =====================

function ConvCard({
    selected,
    label,
    avatar,
    fallback,
    lastMessage,
    badge,
    onClick,
}: {
    selected: boolean;
    label: string;
    avatar?: string;
    fallback?: string;
    lastMessage?: string;
    badge?: React.ReactNode;
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
            <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm truncate flex-1">{label}</p>
                    {badge}
                </div>
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
    const [myConversations, setMyConversations] = useState<Conversation[]>([]); // chỉ dùng cho staff
    const [supportConv, setSupportConv] = useState<Conversation | null>(null);
    const [connected, setConnected] = useState(false);
    const [loadingSupport, setLoadingSupport] = useState(role !== 'staff');
    const [staffTab, setStaffTab] = useState<StaffTab>('unassigned');
    const [assigning, setAssigning] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Cuộn xuống cuối khi có tin nhắn mới — scroll bên trong container, không scroll toàn trang
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, [messages]);

    const currentConversation = useMemo(
        () => [...conversations, ...myConversations].find((c) => c.id === selectedChatId),
        [conversations, myConversations, selectedChatId]
    );

    // ── Fetch supportConv (user/shop) ──
    useEffect(() => {
        if (role === 'staff') return;

        (async () => {
            try {
                const supportRes = await chatService.getOrCreateSupportConversation(
                    role === 'user' ? 'user' : 'shop'
                );
                const conv = supportRes.data;
                setSupportConv(conv);
                setConversations((prev) => {
                    const exists = prev.some((c) => c.id === conv.id);
                    return exists ? prev : [conv, ...prev];
                });
                if (!selectedChatId) {
                    router.replace(getConvRoute(role, conv.id));
                }
            } catch {
                try {
                    const supportRes = await chatService.getOrCreateSupportConversation(
                        role === 'user' ? 'user' : 'shop'
                    );
                    const conv = supportRes.data;
                    setSupportConv(conv);
                    setConversations((prev) => {
                        const exists = prev.some((c) => c.id === conv.id);
                        return exists ? prev : [conv, ...prev];
                    });
                    if (!selectedChatId) {
                        router.replace(getConvRoute(role, conv.id));
                    }
                } catch { /* ignore */ }
            } finally {
                setLoadingSupport(false);
            }
        })();
    }, [role]);

    // ── Fetch conversations + messages ──
    useEffect(() => {
        if (role === 'staff') {
            // Staff: fetch cả unassigned và conversations của mình
            (async () => {
                const [unassignedRes, mineRes] = await Promise.all([
                    chatService.getSupportConversationsAll(),
                    chatService.getMyAssignedConversations(),
                ]);
                setConversations(unassignedRes.data ?? []);
                setMyConversations(mineRes.data ?? []);

                // Nếu chưa chọn, redirect vào conversation đầu của "Của tôi", fallback unassigned
                if (!selectedChatId) {
                    const first = mineRes.data?.[0] ?? unassignedRes.data?.[0];
                    if (first) {
                        setStaffTab(mineRes.data?.[0] ? 'mine' : 'unassigned');
                        router.replace(getConvRoute('staff', first.id));
                    }
                }
            })();
            return;
        }

        if (!selectedChatId) return;

        (async () => {
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

            const msgRes = await chatService.getMessages(selectedChatId);
            setMessages(msgRes.data);
        })();
    }, [selectedChatId, role]);

    // ── Fetch messages khi staff chọn conversation ──
    useEffect(() => {
        if (role !== 'staff' || !selectedChatId) return;
        chatService.getMessages(selectedChatId).then((res) => setMessages(res.data ?? []));
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
            // Staff join room chung để nhận notify real-time
            if (role === 'staff') {
                socket.emit('join_staff_support');
            }
        });

        socket.on('disconnect', () => setConnected(false));

        socket.on('new_message', (data: Message) => {
            setMessages((prev) =>
                prev.some((m) => m.id === data.id) ? prev : [...prev, data]
            );
        });

        // Real-time: ai đó vừa assign conversation → xóa khỏi danh sách unassigned
        socket.on('conversation_assigned', ({ conversationId: cid, assignedStaffId, conversation }) => {
            if (role !== 'staff') return;
            setConversations((prev) => prev.filter((c) => c.id !== cid));
            // Nếu staff này assign, thêm vào "Của tôi"
            if (assignedStaffId === userId) {
                setMyConversations((prev) => {
                    const exists = prev.some((c) => c.id === cid);
                    return exists ? prev : [{ ...conversation, assignedStaffId }, ...prev];
                });
                setStaffTab('mine');
            }
        });

        // Real-time: conversation vừa unassign → thêm lại vào danh sách chờ
        socket.on('conversation_unassigned', ({ conversationId: cid, conversation }) => {
            if (role !== 'staff') return;
            setMyConversations((prev) => prev.filter((c) => c.id !== cid));
            setConversations((prev) => {
                const exists = prev.some((c) => c.id === cid);
                return exists ? prev : [{ ...conversation, assignedStaffId: null }, ...prev];
            });
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); };
    }, [userId, selectedChatId, role]);

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

    // ── Assign (Staff nhận hỗ trợ) ──
    const handleAssign = useCallback(async () => {
        if (!selectedChatId || assigning) return;
        setAssigning(true);
        try {
            await chatService.assignStaff(selectedChatId);
            // Socket event sẽ tự update UI, nhưng cũng update local ngay
            setConversations((prev) => prev.filter((c) => c.id !== selectedChatId));
            setMyConversations((prev) => {
                const conv = conversations.find((c) => c.id === selectedChatId);
                if (!conv) return prev;
                const updated = { ...conv, assignedStaffId: userId };
                const exists = prev.some((c) => c.id === selectedChatId);
                return exists ? prev.map((c) => c.id === selectedChatId ? updated : c) : [updated, ...prev];
            });
            setStaffTab('mine');
        } catch (err: any) {
            alert(err?.message || 'Không thể nhận conversation này');
        } finally {
            setAssigning(false);
        }
    }, [selectedChatId, assigning, conversations, userId]);

    // ── Unassign (Staff kết thúc hỗ trợ) ──
    const handleUnassign = useCallback(async () => {
        if (!selectedChatId) return;
        try {
            await chatService.unassignStaff(selectedChatId);
            // Socket event sẽ update, nhưng cũng update local ngay
            const conv = myConversations.find((c) => c.id === selectedChatId);
            setMyConversations((prev) => prev.filter((c) => c.id !== selectedChatId));
            if (conv) {
                setConversations((prev) => {
                    const updated = { ...conv, assignedStaffId: null };
                    const exists = prev.some((c) => c.id === selectedChatId);
                    return exists ? prev : [updated, ...prev];
                });
            }
            setStaffTab('unassigned');
            router.replace('/staff/dashboard/chat-support');
        } catch (err: any) {
            alert(err?.message || 'Không thể kết thúc hỗ trợ');
        }
    }, [selectedChatId, myConversations]);

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

    // ── Conversation hiện tại có phải của staff này không ──
    const isMyConversation = useMemo(
        () => myConversations.some((c) => c.id === selectedChatId),
        [myConversations, selectedChatId]
    );

    const isUnassignedConversation = useMemo(
        () => conversations.some((c) => c.id === selectedChatId),
        [conversations, selectedChatId]
    );

    // ===================== LOADING STATE =====================

    if (loadingSupport && !selectedChatId) {
        return (
            <div className="flex h-150 items-center justify-center text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Đang tải chat...</span>
                </div>
            </div>
        );
    }

    // ===================== RENDER =====================

    return (
        <div className="flex h-150 overflow-hidden">
            {/* SIDEBAR */}
            <div className="w-64 shrink-0 border-r flex flex-col">
                <div className="px-4 py-4 border-b">
                    <h1 className="text-xl font-bold">Chat</h1>
                </div>

                {role !== 'staff' ? (
                    /* ── User / Shop sidebar ── */
                    <div className="flex-1 min-h-0 overflow-y-auto">
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
                    </div>
                ) : (
                    /* ── Staff sidebar: tab headers cố định, chỉ list scroll ── */
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Tab headers — không scroll */}
                        <div className="flex border-b shrink-0">
                            <button
                                className={`flex-1 py-2 text-xs font-semibold transition-colors ${staffTab === 'unassigned'
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setStaffTab('unassigned')}
                            >
                                Chờ nhận
                                {conversations.length > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 min-w-[18px]">
                                        {conversations.length}
                                    </span>
                                )}
                            </button>
                            <button
                                className={`flex-1 py-2 text-xs font-semibold transition-colors ${staffTab === 'mine'
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setStaffTab('mine')}
                            >
                                Của tôi
                                {myConversations.length > 0 && (
                                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 min-w-[18px]">
                                        {myConversations.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Tab content — chỉ phần này scroll */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <div className="p-2">
                                {staffTab === 'unassigned' ? (
                                    conversations.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-6">
                                            Không có hội thoại nào đang chờ
                                        </p>
                                    ) : (
                                        conversations.map((chat) => (
                                            <ConvCard
                                                key={chat.id}
                                                selected={selectedChatId === chat.id}
                                                label={chat.shop?.name ?? chat.user?.name ?? 'Khách'}
                                                avatar={chat.shop?.logo ?? chat.user?.avatar}
                                                fallback={(chat.shop?.name ?? chat.user?.name)?.[0]}
                                                lastMessage={chat.lastMessage}
                                                badge={
                                                    <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">
                                                        {chat.shopId ? 'Shop' : 'User'}
                                                    </Badge>
                                                }
                                                onClick={() => {
                                                    router.push(getConvRoute('staff', chat.id));
                                                }}
                                            />
                                        ))
                                    )
                                ) : (
                                    myConversations.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-6">
                                            Bạn chưa nhận hội thoại nào
                                        </p>
                                    ) : (
                                        myConversations.map((chat) => (
                                            <ConvCard
                                                key={chat.id}
                                                selected={selectedChatId === chat.id}
                                                label={chat.shop?.name ?? chat.user?.name ?? 'Khách'}
                                                avatar={chat.shop?.logo ?? chat.user?.avatar}
                                                fallback={(chat.shop?.name ?? chat.user?.name)?.[0]}
                                                lastMessage={chat.lastMessage}
                                                onClick={() => router.push(getConvRoute('staff', chat.id))}
                                            />
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CHAT PANEL */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center gap-3 shrink-0">
                    <Avatar>
                        <AvatarFallback>{headerLabel?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{headerLabel || 'Chọn cuộc hội thoại'}</p>
                        <p className="text-xs text-muted-foreground">{connected ? 'Online' : 'Offline'}</p>
                    </div>

                    {/* Staff actions */}
                    {role === 'staff' && selectedChatId > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                            {isUnassignedConversation && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    className="gap-1.5 text-xs h-8"
                                    onClick={handleAssign}
                                    disabled={assigning}
                                >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    {assigning ? 'Đang nhận...' : 'Nhận hỗ trợ'}
                                </Button>
                            )}
                            {isMyConversation && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                    onClick={handleUnassign}
                                >
                                    <UserX className="w-3.5 h-3.5" />
                                    Kết thúc hỗ trợ
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Staff banner khi xem conversation chưa nhận */}
                {role === 'staff' && selectedChatId > 0 && isUnassignedConversation && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
                        <Headphones className="w-3.5 h-3.5 shrink-0" />
                        <span>Conversation này chưa được nhận. Nhấn <strong>Nhận hỗ trợ</strong> để bắt đầu.</span>
                    </div>
                )}

                {/* No conversation selected state */}
                {!selectedChatId && (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <Headphones className="w-10 h-10 opacity-30" />
                            <p className="text-sm">Chọn một cuộc hội thoại để bắt đầu</p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {selectedChatId > 0 && (
                    <>
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
                            <div className="flex flex-col gap-2">
                                {messages.length === 0 && (
                                    <p className="text-center text-xs text-muted-foreground py-8">
                                        Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                                    </p>
                                )}
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

                        {/* Input — chỉ enable khi staff đã nhận hoặc không phải staff */}
                        <div className="px-4 py-3 border-t flex gap-2 shrink-0">
                            {role === 'staff' && isUnassignedConversation ? (
                                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-1">
                                    Nhận hỗ trợ để gửi tin nhắn
                                </div>
                            ) : (
                                <>
                                    <Input
                                        placeholder="Nhập tin nhắn..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        className="flex-1"
                                        disabled={!connected}
                                    />
                                    <Button onClick={handleSend} disabled={!connected || !message.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}