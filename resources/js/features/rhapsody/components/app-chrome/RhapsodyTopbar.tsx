import { Bell, Menu, Search } from 'lucide-react';
import { BrandMark } from '@/features/rhapsody/components/BrandMark';

export function RhapsodyTopbar() {
    return (
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
                        Professional studio scheduling and payment flow.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <IconButton label="Search" icon={Search} />
                    <IconButton label="Notifications" icon={Bell} />
                    <IconButton label="Menu" icon={Menu} mobileOnly />
                </div>
            </div>
        </header>
    );
}

type IconButtonProps = {
    label: string;
    icon: typeof Search;
    mobileOnly?: boolean;
};

function IconButton({ label, icon: Icon, mobileOnly }: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={[
                'grid size-11 place-items-center rounded-md border border-[#353535] text-white transition hover:bg-[#1f1f1f]',
                mobileOnly ? 'lg:hidden' : '',
            ].join(' ')}
        >
            <Icon className="size-5" />
        </button>
    );
}
