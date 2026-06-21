import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '@/components/rhapsody/brand-mark';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Link
                href={home()}
                className="absolute top-5 left-5 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary md:top-8 md:left-8"
            >
                <ArrowLeft className="size-4" />
                Back to Home
            </Link>

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={home()} className="flex flex-col items-center gap-2">
                            <BrandMark />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="font-display text-2xl font-bold text-primary">
                                {title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
