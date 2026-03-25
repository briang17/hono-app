import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod/v4'
import { AcceptInvitationPage } from '@/pages/agent/AcceptInvitationPage'

const InviteAcceptSearchSchema = z.object({
    invitationId: z.string(),
    email: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/(protected)/invite/accept')({
    validateSearch: zodValidator(InviteAcceptSearchSchema),
    component: AcceptInvitationPage,
})
