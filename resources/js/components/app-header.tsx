import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { DesktopNavigation } from '@/components/app-header/desktop-navigation';
import { HeaderActions } from '@/components/app-header/header-actions';
import {
    getMainNavItems,
    rightNavItems,
} from '@/components/app-header/nav-items';
import { MobileNavigation } from '@/components/app-header/mobile-navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth, currentTeam } = page.props;
    const mainNavItems = getMainNavItems(currentTeam);
    const dashboardUrl = mainNavItems[0]?.href ?? '/';

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <MobileNavigation
                        mainNavItems={mainNavItems}
                        rightNavItems={rightNavItems}
                    />

                    <Link
                        href={dashboardUrl}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    <DesktopNavigation items={mainNavItems} />
                    <HeaderActions
                        user={auth.user}
                        rightNavItems={rightNavItems}
                    />
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
