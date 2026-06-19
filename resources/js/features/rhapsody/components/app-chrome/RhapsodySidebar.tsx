import { BrandMark } from '@/features/rhapsody/components/BrandMark';
import { navItems } from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type RhapsodySidebarProps = {
    activeView: RhapsodyView;
    onViewChange: (view: RhapsodyView) => void;
};

export function RhapsodySidebar({
    activeView,
    onViewChange,
}: RhapsodySidebarProps) {
    return (
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#101010] px-6 py-7 lg:flex">
            <BrandMark />
            <UpcomingBookingCard />
            <nav className="mt-8 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.view === activeView;

                    return (
                        <button
                            key={item.view}
                            type="button"
                            onClick={() => onViewChange(item.view)}
                            className={[
                                'flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold tracking-wide transition',
                                isActive
                                    ? 'bg-white text-[#131313]'
                                    : 'text-[#c4c7c8] hover:bg-[#1f1f1f] hover:text-white',
                            ].join(' ')}
                        >
                            <Icon className="size-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
            <SessionStatusCard />
        </aside>
    );
}

function UpcomingBookingCard() {
    return (
        <div className="mt-10 rounded-lg border border-[#2a2a2a] bg-[#171717] p-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#8e9192] uppercase">
                Booking Terdekat
            </p>
            <p className="mt-2 font-['Montserrat'] text-xl leading-snug font-bold text-white">
                Studio A, Besok 14:00 - 16:00
            </p>
        </div>
    );
}

function SessionStatusCard() {
    return (
        <div className="mt-auto rounded-lg border border-[#353535] p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#8e9192] uppercase">
                Session Status
            </p>
            <div className="mt-4 h-2 rounded-full bg-[#2a2a2a]">
                <div className="h-full w-[72%] rounded-full bg-white" />
            </div>
            <p className="mt-3 text-sm font-semibold text-white">
                72% studio utilization
            </p>
        </div>
    );
}
