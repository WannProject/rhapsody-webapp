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
                                    htmlFor="band_name"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Nama Band
                                </Label>
                                <Input
                                    id="band_name"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    name="band_name"
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
                                    type="text"
                                    required
                                    tabIndex={3}
                                    name="contact_name"
                                    placeholder="Nama pemesan (penanggung jawab)"
                                />
                                <InputError message={errors.contact_name} />
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
                                    tabIndex={4}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="whatsapp_number"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    WhatsApp number
                                </Label>
                                <Input
                                    id="whatsapp_number"
                                    type="tel"
                                    required
                                    tabIndex={5}
                                    autoComplete="tel"
                                    name="whatsapp_number"
                                    placeholder="62812xxxxxxx"
                                />
                                <InputError message={errors.whatsapp_number} />
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
                                    tabIndex={6}
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
                                    tabIndex={7}
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
                                tabIndex={8}
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
                                tabIndex={9}
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
