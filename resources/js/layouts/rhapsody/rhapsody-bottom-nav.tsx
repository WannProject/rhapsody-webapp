import { Link, usePage } from '@inertiajs/react';
import { navItems } from '@/lib/rhapsody-data';
import type { Auth } from '@/types';

export function RhapsodyBottomNav() {
    const { props, url } = usePage<{ auth: Auth }>();
    const isAuth = !!props.auth.user;
    const visibleItems = navItems.filter((item) => {
        if (item.adminRequired && (!isAuth || props.auth.user?.role !== 'admin')) return false;
        if (item.authRequired && !isAuth) return false;
        return true;
    });

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] lg:hidden"
            style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}
        >
            {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = url === item.href;

                return (
                    <Link
                        key={item.view}
                        href={item.href}
                        className={[
                            'flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-md text-[11px] font-bold tracking-wide transition',
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-primary',
                        ].join(' ')}
                    >
                        <Icon
                            className={[
                                'size-6',
                                isActive ? 'fill-primary/10' : '',
                            ].join(' ')}
                        />
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
