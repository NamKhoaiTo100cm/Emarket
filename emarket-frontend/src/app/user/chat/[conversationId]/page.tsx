'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@/components/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Paperclip,
    Send,
    Phone,
    Video,
    MoreHorizontal,
    Plus,
    Search,
    MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate as libFormatDate, formatTime as libFormatTime } from '@/lib/date';
import { chatService } from '@/services/chat.service';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { useMe } from '@/components/hooks/useAuth';
import ChatLayout from '@/components/layout/ChatLayout';

interface Message {
    id: number;
    senderId: number;
    senderRole: 'user' | 'seller' | 'admin';
    content: string;
    createdAt: string;
}

function formatTime(dateStr: string) {
    return libFormatTime(dateStr);
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Hôm nay';
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
    }

    return libFormatDate(dateStr);
}

function groupByDate(messages: Message[]) {
    const groups: {
        date: string;
        messages: Message[];
    }[] = [];

    messages.forEach((msg) => {
        const date = new Date(msg.createdAt).toDateString();

        const last = groups[groups.length - 1];

        if (
            last &&
            new Date(
                last.messages[0].createdAt,
            ).toDateString() === date
        ) {
            last.messages.push(msg);
        } else {
            groups.push({
                date,
                messages: [msg],
            });
        }
    });

    return groups;
}

// export default function ChatPage({
//     params,
// }: {
//     params: Promise<{
//         conversationId: string;
//     }>;
// }) {
//     const { conversationId } = use(params);

//     const id = Number(conversationId);

//     const userId = 1; // TODO auth

//     const {
//         messages,
//         sendMessage,
//         connected,
//     } = useChat(id, userId);

//     const [input, setInput] = useState('');

//     const bottomRef =
//         useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         bottomRef.current?.scrollIntoView({
//             behavior: 'smooth',
//         });
//     }, [messages]);

//     const grouped = useMemo(
//         () => groupByDate(messages),
//         [messages],
//     );

//     const handleSend = () => {
//         if (!input.trim()) return;
//         if (!connected) return;

//         sendMessage(input, 'user');
//         setInput('');
//     };

//     return (
//         <TooltipProvider>
//             <div className="h-dvh bg-background overflow-hidden">
//                 <div className="mx-auto flex h-full max-w-6xl border-x bg-background">

//                     {/* CHAT PANEL */}
//                     <div className="flex h-full w-full flex-col">

//                         {/* HEADER */}
//                         <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-xl">
//                             <div className="flex h-16 items-center justify-between px-4">

//                                 <div className="flex min-w-0 items-center gap-3">
//                                     <div className="relative shrink-0">
//                                         <Avatar className="h-11 w-11 border shadow-sm">
//                                             <AvatarImage src="/shop-logo.png" />
//                                             <AvatarFallback className="font-semibold">
//                                                 TL
//                                             </AvatarFallback>
//                                         </Avatar>

//                                         <span
//                                             className={cn(
//                                                 'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
//                                                 connected
//                                                     ? 'bg-emerald-500'
//                                                     : 'bg-zinc-400',
//                                             )}
//                                         />
//                                     </div>

//                                     <div className="min-w-0">
//                                         <div className="flex items-center gap-2">
//                                             <h2 className="truncate text-sm font-semibold">
//                                                 Tech Laptop Store
//                                             </h2>

//                                             <Badge
//                                                 variant="secondary"
//                                                 className="rounded-full text-[10px]"
//                                             >
//                                                 Mall
//                                             </Badge>
//                                         </div>

//                                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                             <span
//                                                 className={cn(
//                                                     'h-2 w-2 rounded-full',
//                                                     connected
//                                                         ? 'bg-emerald-500'
//                                                         : 'bg-zinc-400',
//                                                 )}
//                                             />

//                                             <span>
//                                                 {connected
//                                                     ? 'Đang hoạt động'
//                                                     : 'Đang kết nối...'}
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center gap-1">
//                                     <Tooltip>
//                                         <TooltipTrigger asChild>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className="h-9 w-9 rounded-full text-muted-foreground"
//                                             >
//                                                 <Phone className="h-4 w-4" />
//                                             </Button>
//                                         </TooltipTrigger>

//                                         <TooltipContent>
//                                             Gọi điện
//                                         </TooltipContent>
//                                     </Tooltip>

//                                     <Tooltip>
//                                         <TooltipTrigger asChild>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className="h-9 w-9 rounded-full text-muted-foreground"
//                                             >
//                                                 <Video className="h-4 w-4" />
//                                             </Button>
//                                         </TooltipTrigger>

//                                         <TooltipContent>
//                                             Video
//                                         </TooltipContent>
//                                     </Tooltip>

//                                     <Tooltip>
//                                         <TooltipTrigger asChild>
//                                             <Button
//                                                 variant="ghost"
//                                                 size="icon"
//                                                 className="h-9 w-9 rounded-full text-muted-foreground"
//                                             >
//                                                 <MoreHorizontal className="h-4 w-4" />
//                                             </Button>
//                                         </TooltipTrigger>

//                                         <TooltipContent>
//                                             Thêm
//                                         </TooltipContent>
//                                     </Tooltip>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* CHAT BODY */}
//                         <ScrollArea className="flex-1 bg-muted/15">
//                             <div className="mx-auto flex w-full max-w-4xl flex-col px-4 py-6">

//                                 {grouped.length === 0 ? (
//                                     <div className="flex h-full min-h-[70vh] flex-col items-center justify-center px-6 text-center">
//                                         <Avatar className="h-20 w-20 border shadow-md">
//                                             <AvatarFallback className="text-lg font-semibold">
//                                                 TL
//                                             </AvatarFallback>
//                                         </Avatar>

//                                         <h2 className="mt-5 text-lg font-semibold">
//                                             Tech Laptop Store
//                                         </h2>

//                                         <p className="mt-1 text-sm text-muted-foreground">
//                                             Hãy bắt đầu cuộc trò chuyện
//                                         </p>

//                                         <Badge className="mt-4 rounded-full">
//                                             Phản hồi nhanh
//                                         </Badge>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-6">
//                                         {grouped.map((group) => (
//                                             <div key={group.date}>
//                                                 {/* DATE */}
//                                                 <div className="my-5 flex items-center gap-3">
//                                                     <Separator className="flex-1" />

//                                                     <Badge
//                                                         variant="secondary"
//                                                         className="rounded-full px-4 py-1 text-[11px] font-normal"
//                                                     >
//                                                         {formatDate(
//                                                             group.messages[0]
//                                                                 .createdAt,
//                                                         )}
//                                                     </Badge>

//                                                     <Separator className="flex-1" />
//                                                 </div>

//                                                 <div className="space-y-1.5">
//                                                     {group.messages.map(
//                                                         (msg, i) => {
//                                                             const isMe =
//                                                                 msg.senderRole ===
//                                                                 'user';

//                                                             const prev =
//                                                                 group.messages[
//                                                                 i - 1
//                                                                 ];

//                                                             const next =
//                                                                 group.messages[
//                                                                 i + 1
//                                                                 ];

//                                                             const isFirst =
//                                                                 !prev ||
//                                                                 prev.senderRole !==
//                                                                 msg.senderRole;

//                                                             const isLast =
//                                                                 !next ||
//                                                                 next.senderRole !==
//                                                                 msg.senderRole;

//                                                             return (
//                                                                 <div
//                                                                     key={msg.id}
//                                                                     className={cn(
//                                                                         'flex items-end gap-2 rounded-lg',
//                                                                         isMe
//                                                                             ? 'justify-end'
//                                                                             : 'justify-start',
//                                                                     )}
//                                                                 >
//                                                                     {/* AVATAR */}
//                                                                     {!isMe ? (
//                                                                         <div className="w-8 shrink-0">
//                                                                             {isLast && (
//                                                                                 <Avatar className="h-8 w-8 border">
//                                                                                     <AvatarFallback className="text-xs font-semibold">
//                                                                                         TL
//                                                                                     </AvatarFallback>
//                                                                                 </Avatar>
//                                                                             )}
//                                                                         </div>
//                                                                     ) : (
//                                                                         <div className="w-8" />
//                                                                     )}

//                                                                     {/* MESSAGE */}
//                                                                     <div
//                                                                         className={cn(
//                                                                             'flex flex-col my-2 rounded-lg',
//                                                                             isMe
//                                                                                 ? 'items-end'
//                                                                                 : 'items-start',
//                                                                         )}
//                                                                     >
//                                                                         <div
//                                                                             className={cn(
//                                                                                 'max-w-[78vw] sm:max-w-[70%] px-4 py-2.5 text-sm leading-6 shadow-sm transition-all',
//                                                                                 isMe
//                                                                                     ? 'bg-primary text-primary-foreground'
//                                                                                     : 'border bg-background',

//                                                                                 isMe
//                                                                                     ? cn(
//                                                                                         'rounded-[28px]',
//                                                                                         isFirst &&
//                                                                                         'rounded-br-md',
//                                                                                         !isFirst &&
//                                                                                         'rounded-tr-md',
//                                                                                         !isLast &&
//                                                                                         'rounded-br-md',
//                                                                                     )
//                                                                                     : cn(
//                                                                                         'rounded-[28px]',
//                                                                                         isFirst &&
//                                                                                         'rounded-bl-md',
//                                                                                         !isFirst &&
//                                                                                         'rounded-tl-md',
//                                                                                         !isLast &&
//                                                                                         'rounded-bl-md',
//                                                                                     ),
//                                                                             )}
//                                                                         >
//                                                                             {msg.content}
//                                                                         </div>

//                                                                         {isLast && (
//                                                                             <span className="mt-1 px-2 text-[11px] text-muted-foreground">
//                                                                                 {formatTime(
//                                                                                     msg.createdAt,
//                                                                                 )}
//                                                                             </span>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             );
//                                                         },
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         ))}

//                                         <div ref={bottomRef} />
//                                     </div>
//                                 )}
//                             </div>
//                         </ScrollArea>

//                         {/* INPUT */}
//                         <div className="sticky bottom-0 border-t bg-background/90 backdrop-blur-xl">
//                             <div className="mx-auto flex max-w-4xl items-end gap-3 px-4 py-4">
//                                 <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-10 w-10 shrink-0 rounded-full"
//                                 >
//                                     <Paperclip className="h-4 w-4" />
//                                 </Button>

//                                 <div className="flex flex-1 items-center rounded-[28px] border bg-muted/40 px-3 py-2 shadow-sm transition focus-within:ring-1 focus-within:ring-ring">
//                                     <Input
//                                         value={input}
//                                         onChange={(e) =>
//                                             setInput(
//                                                 e.target.value,
//                                             )
//                                         }
//                                         onKeyDown={(e) =>
//                                             e.key === 'Enter' &&
//                                             handleSend()
//                                         }
//                                         placeholder="Nhập tin nhắn..."
//                                         className="border-0 bg-transparent shadow-none focus-visible:ring-0"
//                                     />
//                                 </div>

//                                 <Button
//                                     size="icon"
//                                     onClick={handleSend}
//                                     disabled={
//                                         !connected ||
//                                         !input.trim()
//                                     }
//                                     className="h-11 w-11 shrink-0 rounded-full shadow-md transition-transform active:scale-95"
//                                 >
//                                     <Send className="h-4 w-4" />
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </TooltipProvider>
//     );
// }


// const conversations = [
//     {
//         id: 1,
//         name: 'Johpn Doe',
//         message: 'Hey, how are you?',
//         online: true,
//         unread: 2,
//     },
//     {
//         id: 2,
//         name: 'Sarah',
//         message: 'See you tomorrow!',
//         online: false,
//         unread: 0,
//     },
//     {
//         id: 3,
//         name: 'Support Bot',
//         message: 'How can I help?',
//         online: true,
//         unread: 0,
//     },
// ];

// const messages = [
//     {
//         id: 1,
//         sender: 'other',
//         content: 'Hello 👋',
//         time: '10:21',
//     },
//     {
//         id: 2,
//         sender: 'me',
//         content: 'Hi! What’s up?',
//         time: '10:22',
//     },
//     {
//         id: 3,
//         sender: 'other',
//         content: 'Need help with the project.',
//         time: '10:22',
//     },
// ];

export default function ChatPage() {
    return (
        <ChatLayout role="user" />
    )
}