import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as teams } from '@/routes/teams';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Teams',
        href: teams(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-8 px-5 py-8 md:px-8 lg:flex-row lg:gap-12">
            <aside className="w-full shrink-0 lg:w-52">
                <div>
                    <h2 className="font-display text-2xl font-bold text-primary">
                        Settings
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your profile and account settings
                    </p>
                </div>
                <nav
                    className="mt-6 flex flex-wrap gap-2 lg:flex-col"
                    aria-label="Settings"
                >
                    {sidebarNavItems.map((item, index) => (
                        <Link
                            key={`${toUrl(item.href)}-${index}`}
                            href={item.href}
                            className={cn(
                                'rounded-md px-4 py-2 text-sm font-semibold transition',
                                isCurrentOrParentUrl(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-primary',
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </aside>

            <Separator className="lg:hidden" />

            <div className="flex-1 md:max-w-2xl">
                <section className="space-y-10">{children}</section>
            </div>
        </div>
    );
}
