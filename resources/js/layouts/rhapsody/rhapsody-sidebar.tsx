import { Link, router, usePage } from '@inertiajs/react';
import { BrandMark } from '@/components/rhapsody/brand-mark';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { navItems } from '@/lib/rhapsody-data';
import { UserRole } from '@/types/user-role';
import type { Auth } from '@/types';
import { LogOut } from 'lucide-react';

export function RhapsodySidebar() {
    const { props } = usePage<{ auth: Auth }>();
    const { currentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const isAuth = !!props.auth.user;
    const role = props.auth.user?.role;
    const visibleItems = navItems.filter((item) => {
        if (!isAuth) {
            return item.audience === 'guest';
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
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-border bg-background px-6 py-7 lg:flex">
            <Link
                href="/"
                className="inline-flex rounded-md bg-primary px-3 py-3 text-primary-foreground"
            >
                <BrandMark />
            </Link>
            {isAuth ? (
                <AccountSummary
                    name={props.auth.user?.name ?? 'User'}
                    role={role ?? UserRole.Customer}
                />
            ) : null}
            <nav className="mt-8 space-y-2">
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
            {isAuth ? (
                <div className="mt-auto grid gap-3">
                    <SessionStatusCard />
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => router.post('/logout')}
                    >
                        <LogOut className="size-4" />
                        Logout
                    </Button>
                </div>
            ) : null}
        </aside>
    );
}

function AccountSummary({ name, role }: { name: string; role: string }) {
    return (
        <div className="mt-10 rounded-lg border border-border bg-muted p-4">
            <p className="mt-2 font-display text-xl leading-snug font-bold text-primary">
                {name}
            </p>
            {/* <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {role === UserRole.SuperAdmin
                    ? 'Superadmin'
                    : role === UserRole.Admin
                      ? 'Admin'
                      : 'Customer'}
            </p> */}
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
