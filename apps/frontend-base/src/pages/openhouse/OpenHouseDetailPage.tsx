import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, DollarSign, Frown, Home, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

    const isPast =
        new Date(openHouse.date) < new Date() &&
        !new Date(openHouse.date).toDateString() === new Date().toDateString()

    return (
        <div className="w-full space-y-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/openhouse' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open Houses
            </Button>

            <div className="space-y-6">
                <div className="relative h-64 overflow-hidden rounded-xl bg-muted">
                    {openHouse.listingImageUrl ? (
                        <img
                            src={openHouse.listingImageUrl}
                            alt={openHouse.propertyAddress}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-20 w-20 text-muted-foreground/30" />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-re-navy/90 to-transparent p-6">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            {openHouse.propertyAddress}
                        </h1>
                        <p className="text-white/90 mt-1">
                            {format(new Date(openHouse.date), 'MMMM d, yyyy')} •{' '}
                            {openHouse.startTime} - {openHouse.endTime}
                        </p>
                    </div>
                    <div className="absolute top-4 right-4">
                        <span
                            className={`px-4 py-2 text-sm font-semibold rounded-full ${isPast ? 'bg-muted/90 text-muted-foreground' : 'bg-re-gold text-re-gold-foreground'}`}
                        >
                            {isPast ? 'Past Event' : 'Upcoming'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-l-4 border-l-re-gold">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-re-gold" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Price</p>
                                    <p className="text-xl font-bold text-re-gold">
                                        {formatCurrency(openHouse.listingPrice)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-re-navy">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-re-navy" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p className="text-base font-semibold text-re-navy">
                                        {format(new Date(openHouse.date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-re-gold">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-re-gold" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Leads</p>
                                    <p className="text-xl font-bold text-re-gold">{leads.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
                    {openHouse.notes && (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-re-navy mb-2">Notes</h3>
                                <p className="text-muted-foreground">{openHouse.notes}</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-re-navy mb-4">
                                Public Sign-In Link
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Share this link with visitors to let them sign in digitally
                            </p>
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
                        </CardContent>
                    </Card>
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
