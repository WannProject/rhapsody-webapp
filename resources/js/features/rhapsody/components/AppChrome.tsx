import { Bell, Menu, Search } from 'lucide-react';
import { BrandMark } from '@/features/rhapsody/components/BrandMark';
import { navItems } from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type AppChromeProps = {
    activeView: RhapsodyView;
    onViewChange: (view: RhapsodyView) => void;
    children: React.ReactNode;
};

export function AppChrome({
    activeView,
    onViewChange,
    children,
}: AppChromeProps) {
    return (
        <div className="min-h-screen bg-[#080808] text-[#e2e2e2] antialiased">
            <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
                <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-[#2a2a2a] bg-[#101010] px-6 py-7 lg:flex">
                    <BrandMark />
                    <div className="mt-10 rounded-lg border border-[#2a2a2a] bg-[#171717] p-4">
                        <p className="text-xs font-semibold tracking-[0.22em] text-[#8e9192] uppercase">
                            Booking Terdekat
                        </p>
                        <p className="mt-2 font-['Montserrat'] text-xl leading-snug font-bold text-white">
                            Studio A, Besok 14:00 - 16:00
                        </p>
                    </div>
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
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-30 border-b border-[#2a2a2a] bg-[#101010]/95 px-5 py-5 backdrop-blur lg:bg-[#080808]/88 lg:px-8">
                        <div className="flex items-center justify-between gap-4">
                            <div className="lg:hidden">
                                <BrandMark />
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-xs font-semibold tracking-[0.22em] text-[#8e9192] uppercase">
                                    Music Booking System
                                </p>
                                <p className="mt-1 text-sm text-[#c4c7c8]">
                                    Professional studio scheduling and payment
                                    flow.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    aria-label="Search"
                                    className="grid size-11 place-items-center rounded-md border border-[#353535] text-white transition hover:bg-[#1f1f1f]"
                                >
                                    <Search className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Notifications"
                                    className="grid size-11 place-items-center rounded-md border border-[#353535] text-white transition hover:bg-[#1f1f1f]"
                                >
                                    <Bell className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Menu"
                                    className="grid size-11 place-items-center rounded-md border border-[#353535] text-white transition hover:bg-[#1f1f1f] lg:hidden"
                                >
                                    <Menu className="size-5" />
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 px-5 pt-7 pb-28 md:px-8 md:pt-9 lg:pb-10">
                        {children}
                    </main>
                </div>
            </div>

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
        </div>
    );
}
