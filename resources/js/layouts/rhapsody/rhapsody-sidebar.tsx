import { Link, usePage } from '@inertiajs/react';
import { BrandMark } from '@/components/rhapsody/brand-mark';
import { navItems } from '@/lib/rhapsody-data';
import type { Auth } from '@/types';

export function RhapsodySidebar() {
    const { props, url } = usePage<{ auth: Auth }>();
    const isAuth = !!props.auth.user;
    const visibleItems = navItems.filter(
        (item) => isAuth || !item.authRequired,
    );

    return (
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-border bg-background px-6 py-7 lg:flex">
            <BrandMark />
            {isAuth ? <UpcomingBookingCard /> : null}
            <nav className="mt-8 space-y-2">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = url === item.href;

                    return (
                        <Link
                            key={item.view}
                            href={item.href}
                            className={[
                                'flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-bold tracking-wide transition',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-primary',
                            ].join(' ')}
                        >
                            <Icon className="size-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            {isAuth ? <SessionStatusCard /> : null}
        </aside>
    );
}

function UpcomingBookingCard() {
    return (
        <div className="mt-10 rounded-lg border border-border bg-muted p-4">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Booking Terdekat
            </p>
            <p className="mt-2 font-display text-xl leading-snug font-bold text-primary">
                Studio A, Besok 14:00 - 16:00
            </p>
        </div>
    );
}

function SessionStatusCard() {
    return (
        <div className="mt-auto rounded-lg border border-border p-4">
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Session Status
            </p>
            <div className="mt-4 h-2 rounded-full bg-muted">
                <div className="h-full w-[72%] rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-sm font-semibold text-primary">
                72% studio utilization
            </p>
        </div>
    );
}
