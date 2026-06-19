import { Mail, X } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TeamInvitation } from '@/types';

type PendingInvitationsSectionProps = {
    invitations: TeamInvitation[];
    canCancelInvitation: boolean;
    onCancelInvitation: (invitation: TeamInvitation) => void;
};

export function PendingInvitationsSection({
    invitations,
    canCancelInvitation,
    onCancelInvitation,
}: PendingInvitationsSectionProps) {
    if (invitations.length === 0) {
        return null;
    }

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Pending invitations"
                description="Invitations that haven't been accepted yet"
            />

            <div className="space-y-3">
                {invitations.map((invitation) => (
                    <div
                        key={invitation.code}
                        data-test="invitation-row"
                        className="flex items-center justify-between rounded-lg border p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="font-medium">
                                    {invitation.email}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {invitation.role_label}
                                </div>
                            </div>
                        </div>

                        {canCancelInvitation ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            data-test="invitation-cancel-button"
                                            onClick={() =>
                                                onCancelInvitation(invitation)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Cancel invitation</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    );
}
