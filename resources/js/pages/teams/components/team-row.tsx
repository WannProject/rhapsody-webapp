import { Link } from '@inertiajs/react';
import { Eye, LogOut, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { edit } from '@/routes/teams';
import type { Team } from '@/types';

type TeamRowProps = {
    team: Team;
    onLeaveTeam: (team: Team) => void;
};

export function TeamRow({ team, onLeaveTeam }: TeamRowProps) {
    const canLeaveTeam = !team.isPersonal && team.role !== 'owner';
    const isMember = team.role === 'member';

    return (
        <div
            data-test="team-row"
            className="flex items-center justify-between gap-4 rounded-lg border p-4"
        >
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{team.name}</span>
                        {team.isPersonal ? (
                            <Badge variant="secondary">Personal</Badge>
                        ) : null}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {team.roleLabel}
                    </span>
                </div>
            </div>

            <TooltipProvider>
                <div className="flex items-center gap-2">
                    {canLeaveTeam ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    data-test="team-leave-button"
                                    onClick={() => onLeaveTeam(team)}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Leave team</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : null}

                    <TeamActionLink
                        team={team}
                        label={isMember ? 'View team' : 'Edit team'}
                        dataTest={
                            isMember ? 'team-view-button' : 'team-edit-button'
                        }
                        icon={isMember ? Eye : Pencil}
                    />
                </div>
            </TooltipProvider>
        </div>
    );
}

type TeamActionLinkProps = {
    team: Team;
    label: string;
    dataTest: string;
    icon: typeof Eye;
};

function TeamActionLink({
    team,
    label,
    dataTest,
    icon: Icon,
}: TeamActionLinkProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" data-test={dataTest} asChild>
                    <Link href={edit(team.slug)}>
                        <Icon className="h-4 w-4" />
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
