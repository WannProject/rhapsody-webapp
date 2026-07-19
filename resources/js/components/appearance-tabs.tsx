import type { LucideIcon } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    compact = false,
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement> & { compact?: boolean }) {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';
    const ActiveIcon: LucideIcon = isDark ? Moon : Sun;
    const nextAppearance = isDark ? 'light' : 'dark';

    return (
        <div
            className={cn(
                'inline-flex items-center gap-3',
                compact ? 'gap-2' : '',
                className,
            )}
            {...props}
        >
            {!compact && (
                <span className="text-sm font-semibold text-muted-foreground">
                    Tema
                </span>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label={isDark ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
                title={isDark ? 'Tema gelap' : 'Tema terang'}
                onClick={() => updateAppearance(nextAppearance)}
                className={cn(
                    'group relative inline-flex h-10 w-[76px] shrink-0 items-center rounded-full border border-border bg-muted p-1 shadow-xs transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                    isDark
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-primary',
                    compact && 'h-8 w-[58px]',
                )}
            >
                <span className="sr-only">
                    {isDark ? 'Tema gelap aktif' : 'Tema terang aktif'}
                </span>
                <span
                    className={cn(
                        'absolute inset-y-1 left-1 grid size-8 place-items-center rounded-full bg-background text-foreground shadow-sm transition-transform',
                        compact && 'size-6',
                        isDark
                            ? compact
                                ? 'translate-x-6'
                                : 'translate-x-8'
                            : 'translate-x-0',
                    )}
                >
                    <ActiveIcon
                        className={cn('size-4', compact && 'size-3.5')}
                        aria-hidden="true"
                    />
                </span>
                <span
                    className={cn(
                        'ml-auto pr-2 text-[10px] font-bold tracking-wide uppercase transition-opacity',
                        compact && 'hidden',
                        isDark ? 'opacity-0' : 'opacity-100',
                    )}
                >
                    Light
                </span>
                <span
                    className={cn(
                        'pl-2 text-[10px] font-bold tracking-wide uppercase transition-opacity',
                        compact && 'hidden',
                        isDark ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    Dark
                </span>
            </button>
        </div>
    );
}
