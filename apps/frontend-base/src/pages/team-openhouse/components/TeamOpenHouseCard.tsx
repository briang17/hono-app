import { format } from 'date-fns'
import { Bath, Bed, Home, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { imagePresets, mainImageUrl } from '@/lib/cloudinary-url'
import type { TeamOpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

interface TeamOpenHouseCardProps {
    openHouse: TeamOpenHouse
    onClick: () => void
}

export function TeamOpenHouseCard({ openHouse, onClick }: TeamOpenHouseCardProps) {
    const imageUrl = mainImageUrl(openHouse.images, imagePresets.card)

    const agentDisplayName =
        openHouse.creatorFirstName && openHouse.creatorLastName
            ? `${openHouse.creatorFirstName} ${openHouse.creatorLastName}`
            : (openHouse.creatorFirstName ?? null)

    return (
        <Card
            className="overflow-hidden hover:shadow-lg hover:border-re-gold/30 transition-all duration-200 cursor-pointer group"
            onClick={onClick}
        >
            <div className="relative h-32 overflow-hidden bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={openHouse.propertyAddress}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Home className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 text-xs font-medium text-white bg-re-navy/90 backdrop-blur-sm rounded-full">
                        {format(new Date(openHouse.date), 'MMM d')}
                    </span>
                </div>
            </div>
            <CardContent className="p-3 space-y-1.5">
                <h3 className="font-semibold text-sm text-re-navy line-clamp-1 group-hover:text-re-gold transition-colors">
                    {openHouse.propertyAddress}
                </h3>
                <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-re-gold">
                        {formatCurrency(openHouse.listingPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {openHouse.startTime} - {openHouse.endTime}
                    </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        {openHouse.bedrooms != null && (
                            <span className="flex items-center gap-0.5">
                                <Bed className="h-3 w-3" />
                                {openHouse.bedrooms} bd
                            </span>
                        )}
                        {openHouse.bathrooms != null && (
                            <span className="flex items-center gap-0.5">
                                <Bath className="h-3 w-3" />
                                {openHouse.bathrooms} ba
                            </span>
                        )}
                    </div>
                    {agentDisplayName && (
                        <span className="flex items-center gap-1 text-sm font-medium">
                            <User className="h-3.5 w-3.5" />
                            {agentDisplayName}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
