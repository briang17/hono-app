import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Frown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/api/auth-client'

export function AcceptInvitationPage() {
    const routeApi = getRouteApi('/(protected)/invite/accept')
    const { invitationId } = routeApi.useSearch()
    const navigate = useNavigate()
    const session = authClient.useSession()
    const [hasError, setHasError] = useState(false)
    const acceptedRef = useRef(false)

    useEffect(() => {
        if (session.isPending) return
        if (acceptedRef.current) return

        if (!session.data?.user) {
            navigate({
                to: '/auth/sign-up',
                search: {
                    invitationId,
                    redirect: `/invite/accept?invitationId=${invitationId}`,
                },
            })
            return
        }

        acceptedRef.current = true

        authClient.organization
            .acceptInvitation({ invitationId })
            .then(async ({ data, error }) => {
                if (error || !data?.member?.organizationId) {
                    setHasError(true)
                    return
                }
                await authClient.organization.setActive({
                    organizationId: data.member.organizationId,
                })
                navigate({ to: '/dashboard' })
            })
            .catch(() => setHasError(true))
    }, [session.isPending, session.data, invitationId, navigate])

    if (session.isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md px-4">
                    <p className="text-muted-foreground">Setting up your account…</p>
                </div>
            </div>
        )
    }

    if (hasError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md px-4">
                    <Frown size={48} strokeWidth={1.5} className="mx-auto text-destructive mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Could not accept invitation</h3>
                    <p className="text-muted-foreground mb-4">
                        This invitation may have expired or already been used.
                    </p>
                    <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md px-4">
                <p className="text-muted-foreground">Setting up your account…</p>
            </div>
        </div>
    )
}
