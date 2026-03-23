import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { format } from 'date-fns'
import { CheckCircle2, Frown } from 'lucide-react'
import { useState } from 'react'
import { useCreateOpenHouseLead } from '@/lib/mutations/openhouse'
import { usePublicOpenHouse } from '@/lib/queries/openhouse'
import { cn } from '@/lib/utils'
import { CreateOpenHouseLeadForm } from './components/CreateOpenHouseLeadForm'

export function VisitorSignInError() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md px-4">
                <div className="text-4xl mb-4">
                    <Frown size={48} strokeWidth={1.5} className={cn('mx-auto text-destructive')} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Open House not found</h3>
                <p className="text-muted-foreground">
                    The open house you're looking for doesn't exist.
                </p>
            </div>
        </div>
    )
}

export function VisitorSignInPage() {
    const routeApi = getRouteApi('/public/open-houses/sign-in/$openHouseId')
    const { openHouseId } = routeApi.useParams()
    const { data: openHouse } = useSuspenseQuery(usePublicOpenHouse(openHouseId))
    const createLead = useCreateOpenHouseLead(openHouseId)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (values: { [key: string]: unknown }) => {
        await createLead.mutateAsync(values as never)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md px-4">
                    <div className="text-4xl mb-4">
                        <CheckCircle2
                            size={48}
                            strokeWidth={1.5}
                            className={cn('mx-auto text-green-600')}
                        />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
                    <p className="text-muted-foreground">
                        You've been signed in. The agent will be in touch soon.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
                    <p className="text-muted-foreground">{openHouse.propertyAddress}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(openHouse.date), 'MMMM d, yyyy')} • {openHouse.startTime} -{' '}
                        {openHouse.endTime}
                    </p>
                </div>

                <CreateOpenHouseLeadForm onSubmit={handleSubmit} submitLabel="Sign In" />
            </div>
        </div>
    )
}
