import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

type MobileNavigationProps = {
    mainNavItems: NavItem[];
    rightNavItems: NavItem[];
};

export function MobileNavigation({
    mainNavItems,
    rightNavItems,
}: MobileNavigationProps) {
    return (
        <div className="lg:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 h-[34px] w-[34px]"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                >
                    <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                    <SheetHeader className="flex justify-start text-left">
                        <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                    </SheetHeader>
                    <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                        <div className="flex h-full flex-col justify-between text-sm">
                            <div className="flex flex-col space-y-4">
                                {mainNavItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex items-center space-x-2 font-medium"
                                    >
                                        {item.icon ? (
                                            <item.icon className="h-5 w-5" />
                                        ) : null}
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>

                            <div className="flex flex-col space-y-4">
                                {rightNavItems.map((item) => (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 font-medium"
                                    >
                                        {item.icon ? (
                                            <item.icon className="h-5 w-5" />
                                        ) : null}
                                        <span>{item.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
