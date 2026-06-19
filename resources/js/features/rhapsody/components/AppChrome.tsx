import { RhapsodyBottomNav } from '@/features/rhapsody/components/app-chrome/RhapsodyBottomNav';
import { RhapsodySidebar } from '@/features/rhapsody/components/app-chrome/RhapsodySidebar';
import { RhapsodyTopbar } from '@/features/rhapsody/components/app-chrome/RhapsodyTopbar';
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
                <RhapsodySidebar
                    activeView={activeView}
                    onViewChange={onViewChange}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <RhapsodyTopbar />

                    <main className="flex-1 px-5 pt-7 pb-28 md:px-8 md:pt-9 lg:pb-10">
                        {children}
                    </main>
                </div>
            </div>

            <RhapsodyBottomNav
                activeView={activeView}
                onViewChange={onViewChange}
            />
        </div>
    );
}
