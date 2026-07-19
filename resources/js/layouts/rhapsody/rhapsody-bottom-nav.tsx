import { Link, usePage } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { navItems } from '@/lib/rhapsody-data';
import { UserRole } from '@/types/user-role';
import type { Auth } from '@/types';

export function RhapsodyBottomNav() {
    const { props } = usePage<{ auth: Auth }>();
    const { currentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const isAuth = !!props.auth.user;
    const role = props.auth.user?.role;
    const visibleItems = navItems.filter((item) => {
        if (!isAuth) {
            return item.audience === 'guest';
        }

        if (!item.bottomNav) {
            return false;
        }

        if (role === UserRole.SuperAdmin) {
            return ['admin', 'super_admin'].includes(item.audience ?? '');
        }

        if (role === UserRole.Admin) {
            return item.audience === 'admin';
        }

        return item.audience === 'customer';
    });

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] lg:hidden"
            style={{
                gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))`,
            }}
        >
            {visibleItems.map((item, index) => {
                const Icon = item.icon;
                const itemPath = item.href.split('#')[0].split('?')[0];
                const isActive =
                    itemPath === '/'
                        ? currentUrl === '/'
                        : isCurrentOrParentUrl(itemPath);

                return (
                    <Link
                        key={`${item.audience}-${item.view}-${index}`}
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
