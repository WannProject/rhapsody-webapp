import type { LucideIcon } from 'lucide-react';
import type { RhapsodyView } from '@/features/rhapsody/types';

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
                    ? 'bg-white text-[#131313] hover:bg-[#e5e2e1]'
                    : 'border border-[#353535] bg-[#1b1b1b] text-white hover:border-white',
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
                            ? 'font-semibold text-[#454747]'
                            : 'text-[#8e9192]',
                    ].join(' ')}
                >
                    {description}
                </span>
            </span>
            <TrailingIcon className="size-5" />
        </button>
    );
}
