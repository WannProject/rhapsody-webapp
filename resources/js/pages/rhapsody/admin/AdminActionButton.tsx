import type { LucideIcon } from 'lucide-react';
import type { RhapsodyView } from '@/types/rhapsody';

type AdminActionButtonProps = {
    title: string;
    description: string;
    view: RhapsodyView;
    leadingIcon: LucideIcon;
    trailingIcon: LucideIcon;
    variant: 'dark' | 'light';
    onViewChange: (view: RhapsodyView) => void;
};

export function AdminActionButton({
    title,
    description,
    view,
    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    variant,
    onViewChange,
}: AdminActionButtonProps) {
    const isLight = variant === 'light';

    return (
        <button
            type="button"
            onClick={() => onViewChange(view)}
            className={[
                'flex min-h-[78px] items-center gap-4 rounded-md px-5 text-left transition',
                isLight
                    ? 'bg-primary text-primary-foreground hover:bg-secondary'
                    : 'border border-border bg-card text-white hover:border-primary',
            ].join(' ')}
        >
            <LeadingIcon className="size-7" />
            <span className="flex-1">
                <span
                    className={[
                        'block',
                        isLight ? 'font-extrabold' : 'font-bold',
                    ].join(' ')}
                >
                    {title}
                </span>
                <span
                    className={[
                        'text-sm',
                        isLight
                            ? 'font-semibold text-muted-foreground/60'
                            : 'text-muted-foreground',
                    ].join(' ')}
                >
                    {description}
                </span>
            </span>
            <TrailingIcon className="size-5" />
        </button>
    );
}
