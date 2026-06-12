import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showLabel?: boolean;
}

const sizeMap = {
    sm: { icon: 14, text: 'text-xs' },
    md: { icon: 18, text: 'text-sm' },
    lg: { icon: 22, text: 'text-base' },
};

export default function VerifiedBadge({ size = 'md', className, showLabel = false }: VerifiedBadgeProps) {
    const { icon, text } = sizeMap[size];
    return (
        <span
            title="Shop đã được xác thực"
            className={cn('inline-flex items-center gap-1 text-blue-500', className)}
        >
            <BadgeCheck size={icon} className="fill-blue-500 text-white" />
            {showLabel && (
                <span className={cn('font-medium', text)}>Đã xác thực</span>
            )}
        </span>
    );
}
