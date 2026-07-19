import { AudioWaveform } from 'lucide-react';
import { cn } from '@/lib/utils';

type BrandMarkProps = {
    compact?: boolean;
    className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
    return (
        <div
            className={cn(
                'flex min-w-0 items-center gap-3 text-primary-foreground',
                className,
            )}
        >
            <AudioWaveform
                className="size-7 shrink-0 stroke-[2.4]"
                aria-hidden="true"
            />
            {!compact && (
                <span className="truncate font-['Montserrat'] text-[26px] leading-none font-extrabold tracking-tight">
                    RHAPSODY
                </span>
            )}
        </div>
    );
}
