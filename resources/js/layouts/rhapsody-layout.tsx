import { RhapsodyBottomNav } from '@/layouts/rhapsody/rhapsody-bottom-nav';
import { RhapsodySidebar } from '@/layouts/rhapsody/rhapsody-sidebar';
import { RhapsodyTopbar } from '@/layouts/rhapsody/rhapsody-topbar';

type RhapsodyLayoutProps = {
    children: React.ReactNode;
};

export default function RhapsodyLayout({ children }: RhapsodyLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
                <RhapsodySidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <RhapsodyTopbar />

                    <main className="flex-1 px-5 pt-7 pb-28 md:px-8 md:pt-9 lg:pb-10">
                        {children}
                    </main>
                </div>
            </div>

            <RhapsodyBottomNav />
        </div>
    );
}
