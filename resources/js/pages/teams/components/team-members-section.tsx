import { ChevronDown, UserPlus, X } from 'lucide-react';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import type { RoleOption, TeamMember, TeamPermissions } from '@/types';

type TeamMembersSectionProps = {
    members: TeamMember[];
    permissions: TeamPermissions;
    availableRoles: RoleOption[];
    onInviteMember: () => void;
    onUpdateRole: (member: TeamMember, newRole: string) => void;
    onRemoveMember: (member: TeamMember) => void;
};

export function TeamMembersSection({
    members,
    permissions,
    availableRoles,
    onInviteMember,
    onUpdateRole,
    onRemoveMember,
}: TeamMembersSectionProps) {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <Heading
                    variant="small"
                    title="Team members"
                    description={
                        permissions.canCreateInvitation
                            ? 'Manage who belongs to this team'
                            : ''
                    }
                />

                {permissions.canCreateInvitation ? (
                    <Button
                        data-test="invite-member-button"
                        onClick={onInviteMember}
                    >
                        <UserPlus /> Invite member
                    </Button>
                ) : null}
            </div>

            <div className="space-y-3">
                {members.map((member) => (
                    <TeamMemberRow
                        key={member.id}
                        member={member}
                        availableRoles={availableRoles}
                        canUpdateMember={permissions.canUpdateMember}
                        canRemoveMember={permissions.canRemoveMember}
                        onUpdateRole={onUpdateRole}
                        onRemoveMember={onRemoveMember}
                    />
                ))}
            </div>
        </section>
    );
}

type TeamMemberRowProps = {
    member: TeamMember;
    availableRoles: RoleOption[];
    canUpdateMember: boolean;
    canRemoveMember: boolean;
    onUpdateRole: (member: TeamMember, newRole: string) => void;
    onRemoveMember: (member: TeamMember) => void;
};

function TeamMemberRow({
    member,
    availableRoles,
    canUpdateMember,
    canRemoveMember,
    onUpdateRole,
    onRemoveMember,
}: TeamMemberRowProps) {
    const getInitials = useInitials();
    const isOwner = member.role === 'owner';

    return (
        <div
            data-test="member-row"
            className="flex items-center justify-between rounded-lg border p-4"
        >
            <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                    {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {member.email}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {!isOwner && canUpdateMember ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                data-test="member-role-trigger"
                            >
                                {member.role_label}
                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {availableRoles.map((role) => (
                                <DropdownMenuItem
                                    key={role.value}
                                    data-test="member-role-option"
                                    onSelect={() =>
                                        onUpdateRole(member, role.value)
                                    }
                                >
                                    {role.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Badge variant="secondary">{member.role_label}</Badge>
                )}

                {!isOwner && canRemoveMember ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    data-test="member-remove-button"
                                    onClick={() => onRemoveMember(member)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Remove member</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : null}
            </div>
        </div>
    );
}
