import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { TeamInvitationContext } from '@/types';

type Props = {
    passwordRules: string;
    teamInvitation?: TeamInvitationContext | null;
};

const demoCredentials = {
    email: 'customer@rhapsody.test',
    password: 'password',
};

export default function Register({ passwordRules, teamInvitation }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {teamInvitation && (
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Register"
                            />
                        )}

                        <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm">
                            <div className="font-medium text-foreground">
                                Akun demo untuk mencoba aplikasi
                            </div>
                            <dl className="mt-3 grid gap-2 text-muted-foreground">
                                <div className="flex items-center justify-between gap-3">
                                    <dt>Email</dt>
                                    <dd className="font-mono text-foreground">
                                        {demoCredentials.email}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt>Password</dt>
                                    <dd className="font-mono text-foreground">
                                        {demoCredentials.password}
                                    </dd>
                                </div>
                            </dl>
                            <div className="mt-3 text-muted-foreground">
                                Sudah punya akun demo?{' '}
                                <TextLink
                                    href={
                                        teamInvitation
                                            ? login.url({
                                                  query: {
                                                      invitation:
                                                          teamInvitation.code,
                                                  },
                                              })
                                            : login()
                                    }
                                >
                                    Masuk di sini
                                </TextLink>
                                .
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="phone"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    WhatsApp number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={3}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="62812xxxxxxx"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Password
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink
                                href={
                                    teamInvitation
                                        ? login.url({
                                              query: {
                                                  invitation:
                                                      teamInvitation.code,
                                              },
                                          })
                                        : login()
                                }
                                data-test="team-invitation-login-link"
                                tabIndex={7}
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
