import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { format } from 'date-fns'
import { CheckCircle2, Frown, Home } from 'lucide-react'
import { useState } from 'react'
import { imagePresets, mainImageUrl } from '@/lib/cloudinary-url'
import { useCreateOpenHouseLead } from '@/lib/mutations/openhouse'
import { usePublicOpenHouse } from '@/lib/queries/openhouse'
import { cn } from '@/lib/utils'
import { VisitorSignInForm } from './components/VisitorSignInForm'

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

    const customFields = openHouse.formConfig?.questions ?? []

    async function handleSubmit(values: {
        firstName: string
        lastName: string
        email: string | null
        phone: string | null
        workingWithAgent: boolean
        responses?: Record<string, unknown>
    }) {
        await createLead.mutateAsync(values)
        setSubmitted(true)
    }

    const heroUrl = mainImageUrl(openHouse.images, imagePresets.heroLarge)

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md px-4">
                    <div className="w-20 h-20 bg-re-gold/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle2 size={40} strokeWidth={1.5} className={cn('text-re-gold')} />
                    </div>
                    <h2 className="text-2xl font-bold text-re-navy mb-2">Thank you!</h2>
                    <p className="text-muted-foreground">
                        You've been signed in. The agent will be in touch soon.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-re-navy">
                {heroUrl ? (
                    <img
                        src={heroUrl}
                        alt={openHouse.propertyAddress}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-32 w-32 text-re-navy/20" />
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-4">
                    <div className="max-w-md mx-auto space-y-2">
                        <h2 className="text-2xl font-bold text-white text-center leading-tight drop-shadow-md">
                            {openHouse.propertyAddress}
                        </h2>
                        <p className="text-sm text-re-gold font-medium text-center">
                            {format(new Date(openHouse.date), 'MMMM d, yyyy')} •{' '}
                            {openHouse.startTime} - {openHouse.endTime}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
                <div className="w-full max-w-md space-y-6">
                    <VisitorSignInForm customFields={customFields} onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    )
}
