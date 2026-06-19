import { Search } from 'lucide-react';
import { TeamSwitcher } from '@/components/team-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { toUrl } from '@/lib/utils';
import type { NavItem, User } from '@/types';

type HeaderActionsProps = {
    user: User;
    rightNavItems: NavItem[];
};

export function HeaderActions({ user, rightNavItems }: HeaderActionsProps) {
    const getInitials = useInitials();

    return (
        <div className="ml-auto flex items-center space-x-2">
            <div className="relative flex items-center space-x-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="group h-9 w-9 cursor-pointer"
                >
                    <Search className="size-5! opacity-80 group-hover:opacity-100" />
                </Button>
                <ExternalNavLinks items={rightNavItems} />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="size-10 rounded-full p-1"
                    >
                        <Avatar className="size-8 overflow-hidden rounded-full">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <UserMenuContent user={user} />
                </DropdownMenuContent>
            </DropdownMenu>

            <TeamSwitcher inHeader />
        </div>
    );
}

type ExternalNavLinksProps = {
    items: NavItem[];
};

function ExternalNavLinks({ items }: ExternalNavLinksProps) {
    return (
        <div className="ml-1 hidden gap-1 lg:flex">
            {items.map((item) => (
                <TooltipProvider key={item.title} delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger>
                            <a
                                href={toUrl(item.href)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                <span className="sr-only">{item.title}</span>
                                {item.icon ? (
                                    <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                ) : null}
                            </a>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{item.title}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </div>
    );
}
