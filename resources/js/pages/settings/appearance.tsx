import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <div className="grid gap-6">
                <div>
                    <h2 className="font-display text-xl font-bold text-primary">
                        Appearance
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the appearance settings for your account
                    </p>
                </div>
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
