import { Link, router, usePage } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { BrandMark } from '@/components/rhapsody/brand-mark';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { login } from '@/routes';
import { register } from '@/routes';
import type { Auth } from '@/types';
import { LogIn, LogOut, UserCircle, UserPlus } from 'lucide-react';

export function RhapsodyTopbar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    return (
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-5 lg:px-8 lg:py-5">
            <div className="flex items-center justify-between gap-3 lg:gap-4">
                <div className="min-w-0 shrink lg:hidden">
                    <Link
                        href="/"
                        className="inline-flex max-w-full rounded-md px-1 py-1.5 text-primary"
                        aria-label="RHAPSODY"
                    >
                        <BrandMark className="text-primary [&>span]:text-[20px] sm:[&>span]:text-[26px]" />
                    </Link>
                </div>
                <div className="hidden lg:block">
                    <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                        Music Booking System
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Professional studio scheduling and payment flow.
                    </p>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-2">
                    <AppearanceTabs compact />
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-8 gap-2 px-2 sm:h-9 sm:px-3"
                                    aria-label="Menu profil"
                                >
                                    <span className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                                        {user.name?.charAt(0) ?? '?'}
                                    </span>
                                    <span className="hidden max-w-24 truncate text-sm sm:inline">
                                        {user.name?.split(' ')[0]}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <span className="block truncate">
                                        {user.name}
                                    </span>
                                    <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                                        {user.email}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile">
                                        <UserCircle className="size-4" />
                                        Profil
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() => router.post('/logout')}
                                >
                                    <LogOut className="size-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="outline" asChild>
                                <Link href={login()}>
                                    <LogIn className="size-4" />
                                    <span className="hidden sm:inline">
                                        Login
                                    </span>
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={register()}>
                                    <UserPlus className="size-4" />
                                    <span className="hidden sm:inline">
                                        Register
                                    </span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
