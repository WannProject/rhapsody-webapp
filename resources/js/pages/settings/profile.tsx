import { Form, Head, usePage } from '@inertiajs/react';
/* @chisel-email-verification */
import { Link } from '@inertiajs/react';
/* @end-chisel-email-verification */
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
/* @chisel-email-verification */
import { send } from '@/routes/verification';
/* @end-chisel-email-verification */

type PageProps = {
    auth: Auth;
};

export default function Profile(
    /* @chisel-email-verification */
    {
        mustVerifyEmail,
        status,
    }: {
        mustVerifyEmail: boolean;
        status?: string;
    },
    /* @end-chisel-email-verification */
) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profile settings" />

            <div className="grid gap-6">
                <div>
                    <h2 className="font-display text-xl font-bold text-primary">
                        Profile
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update your contact information
                    </p>
                </div>

                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="grid gap-5 rounded-lg border border-border bg-card p-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="band_name"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Nama Band
                                </Label>
                                <Input
                                    id="band_name"
                                    defaultValue={
                                        (auth.user.band_name as string) ?? ''
                                    }
                                    name="band_name"
                                    required
                                    placeholder="Nama band Anda"
                                />
                                <InputError message={errors.band_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="contact_name"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Nama Pemesan
                                </Label>
                                <Input
                                    id="contact_name"
                                    defaultValue={
                                        (auth.user.contact_name as string) ?? ''
                                    }
                                    name="contact_name"
                                    required
                                    placeholder="Nama pemesan (penanggung jawab)"
                                />
                                <InputError message={errors.contact_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="whatsapp_number"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    WhatsApp Number
                                </Label>
                                <Input
                                    id="whatsapp_number"
                                    type="tel"
                                    defaultValue={
                                        (auth.user.whatsapp_number as string) ??
                                        ''
                                    }
                                    name="whatsapp_number"
                                    required
                                    autoComplete="tel"
                                    placeholder="62812xxxxxxx"
                                />
                                <InputError message={errors.whatsapp_number} />
                            </div>

                            {/* @chisel-email-verification */}
                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <p className="text-sm text-muted-foreground">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                                        >
                                            Click here to re-send the
                                            verification email.
                                        </Link>
                                        {status ===
                                            'verification-link-sent' && (
                                            <span className="ml-2 text-sm font-medium text-green-400">
                                                Verification link sent.
                                            </span>
                                        )}
                                    </p>
                                )}
                            {/* @end-chisel-email-verification */}

                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Save
                            </Button>
                        </>
                    )}
                </Form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
