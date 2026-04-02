import { format } from 'date-fns'
import { ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { imagePresets, mainImageUrl } from '@/lib/cloudinary-url'
import type { OpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

interface OpenHouseCardProps {
    openHouse: OpenHouse
    onClick: () => void
}

export function OpenHouseCard({ openHouse, onClick }: OpenHouseCardProps) {
    const imageUrl = mainImageUrl(openHouse.images, imagePresets.card)

    return (
        <Card
            className="overflow-hidden hover:shadow-lg hover:border-re-gold/30 transition-all duration-200 cursor-pointer group"
            onClick={onClick}
        >
            <div className="relative h-48 overflow-hidden bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={openHouse.propertyAddress}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Home className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 text-xs font-medium text-white bg-re-navy/90 backdrop-blur-sm rounded-full">
                        {format(new Date(openHouse.date), 'MMM d')}
                    </span>
                </div>
            </div>
            <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-base text-re-navy line-clamp-2 group-hover:text-re-gold transition-colors">
                    {openHouse.propertyAddress}
                </h3>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-re-gold">
                        {formatCurrency(openHouse.listingPrice)}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {openHouse.startTime} - {openHouse.endTime}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button
                    variant="ghost"
                    className="w-full justify-between hover:text-re-gold hover:bg-re-gold/10"
                >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
