import type { Search} from 'lucide-react';
import { Bell, LogIn, LogOut, Menu, UserPlus } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import { BrandMark } from '@/components/rhapsody/brand-mark';
import { login } from '@/routes';
import { register } from '@/routes';
import type { Auth } from '@/types';

export function RhapsodyTopbar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;

    return (
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-5 py-5 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-4">
                <div className="lg:hidden">
                    <Link href="/">
                        <BrandMark />
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
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <Link
                                href="/settings/profile"
                                className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-card"
                            >
                                <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                    {user.name?.charAt(0) ?? '?'}
                                </span>
                                <span className="hidden sm:inline">
                                    {user.name?.split(' ')[0]}
                                </span>
                            </Link>
                            <button
                                type="button"
                                onClick={() =>
                                    router.post('/logout')
                                }
                                className="grid size-11 place-items-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-primary"
                                aria-label="Logout"
                            >
                                <LogOut className="size-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary transition hover:bg-card"
                            >
                                <LogIn className="size-4" />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                            <Link
                                href={register()}
                                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95"
                            >
                                <UserPlus className="size-4" />
                                <span className="hidden sm:inline">
                                    Register
                                </span>
                            </Link>
                        </>
                    )}
                    <IconButton label="Menu" icon={Menu} mobileOnly />
                </div>
            </div>
        </header>
    );
}

type IconButtonProps = {
    label: string;
    icon: typeof Search;
    mobileOnly?: boolean;
};

function IconButton({ label, icon: Icon, mobileOnly }: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            className={[
                'grid size-11 place-items-center rounded-md border border-border text-white transition hover:bg-muted',
                mobileOnly ? 'lg:hidden' : '',
            ].join(' ')}
        >
            <Icon className="size-5" />
        </button>
    );
}
