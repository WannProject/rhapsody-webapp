import { Form } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { update } from '@/routes/teams';
import type { Team } from '@/types';

type TeamSettingsSectionProps = {
    team: Team;
    canUpdateTeam: boolean;
};

export function TeamSettingsSection({
    team,
    canUpdateTeam,
}: TeamSettingsSectionProps) {
    if (!canUpdateTeam) {
        return (
            <section className="space-y-6">
                <Heading variant="small" title={team.name} />
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Team settings"
                description="Update your team name and settings"
            />

            <Form {...update.form(team.slug)} className="space-y-6">
                {({ errors, processing }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Team name</Label>
                            <Input
                                id="name"
                                name="name"
                                data-test="team-name-input"
                                defaultValue={team.name}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                data-test="team-save-button"
                                disabled={processing}
                            >
                                Save
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}
