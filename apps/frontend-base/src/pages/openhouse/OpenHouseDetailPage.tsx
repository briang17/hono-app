import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOpenHouse, useOpenHouseLeads } from '@/lib/queries/openhouse'
import { cn, formatCurrency } from '@/lib/utils'
import { LeadList } from './components/LeadList'
import { QRCodeDisplay } from './components/QRCodeDisplay'

export function OpenHouseDetailError() {
    const navigate = useNavigate()
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="text-4xl mb-4">
                    <Frown size={48} strokeWidth={1.5} className={cn('mx-auto text-destructive')} />
                </div>
                <h3 className="text-lg font-semibold mb-2">Open House not found</h3>
                <p className="text-muted-foreground mb-4">
                    The open house you're looking for doesn't exist or has been deleted.
                </p>
                <Button variant="outline" onClick={() => navigate({ to: '/openhouse' })}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Open Houses
                </Button>
            </div>
        </div>
    )
}

export function OpenHouseDetailPage() {
    const routeApi = getRouteApi('/(protected)/(organization)/openhouse/$openHouseId')
    const navigate = useNavigate()

    const { openHouseId } = routeApi.useParams()
    const { data: openHouse } = useSuspenseQuery(useOpenHouse(openHouseId))
    const { data: leads } = useSuspenseQuery(useOpenHouseLeads(openHouseId))

    const signInUrl = `${window.location.origin}/public/open-houses/sign-in/${openHouseId}`

    return (
        <div className="w-full space-y-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/openhouse' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open Houses
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">{openHouse.propertyAddress}</h1>
                <p className="text-muted-foreground mt-1">
                    {format(new Date(openHouse.date), 'MMMM d, yyyy')} • {openHouse.startTime} -{' '}
                    {openHouse.endTime}
                </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full sm:w-auto overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="qr">QR & Flyer</TabsTrigger>
                    <TabsTrigger value="leads">
                        Leads {leads.length > 0 && `(${leads.length})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Property Address</h3>
                            <p className="text-muted-foreground">{openHouse.propertyAddress}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Date & Time</h3>
                            <p className="text-muted-foreground">
                                {format(new Date(openHouse.date), 'MMMM d, yyyy')}
                                <br />
                                {openHouse.startTime} - {openHouse.endTime}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Listing Price</h3>
                            <p className="text-muted-foreground text-2xl font-semibold">
                                {formatCurrency(openHouse.listingPrice)}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Leads Collected</h3>
                            <p className="text-muted-foreground text-2xl font-semibold">
                                {leads.length}
                            </p>
                        </div>
                    </div>

                    {openHouse.notes && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Notes</h3>
                            <p className="text-muted-foreground">{openHouse.notes}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Public Sign-In Link</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <code className="flex-1 p-3 rounded-md bg-muted text-sm overflow-x-auto text-xs sm:text-sm">
                                {signInUrl}
                            </code>
                            <Button
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(signInUrl)}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="qr" className="mt-6">
                    <QRCodeDisplay url={signInUrl} openHouse={openHouse} />
                </TabsContent>

                <TabsContent value="leads" className="mt-6">
                    <LeadList leads={leads} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
