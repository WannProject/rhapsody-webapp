import { navItems } from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type RhapsodyBottomNavProps = {
    activeView: RhapsodyView;
    onViewChange: (view: RhapsodyView) => void;
};

export function RhapsodyBottomNav({
    activeView,
    onViewChange,
}: RhapsodyBottomNavProps) {
    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#2a2a2a] bg-[#101010] px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] lg:hidden">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.view === activeView;

                return (
                    <button
                        key={item.view}
                        type="button"
                        onClick={() => onViewChange(item.view)}
                        className={[
                            'flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-bold tracking-wide transition',
                            isActive
                                ? 'text-white'
                                : 'text-[#8e9192] hover:text-white',
                        ].join(' ')}
                    >
                        <Icon
                            className={[
                                'size-6',
                                isActive ? 'fill-white/10' : '',
                            ].join(' ')}
                        />
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}
