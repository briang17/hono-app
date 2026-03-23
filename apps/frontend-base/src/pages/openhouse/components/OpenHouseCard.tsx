import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { OpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

interface OpenHouseCardProps {
    openHouse: OpenHouse
    onClick: () => void
}

export function OpenHouseCard({ openHouse, onClick }: OpenHouseCardProps) {
    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={onClick}
        >
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg line-clamp-2">
                        {openHouse.propertyAddress}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(openHouse.date), 'MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                        {formatCurrency(openHouse.listingPrice)}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {openHouse.startTime} - {openHouse.endTime}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="ghost" className="w-full justify-between">
                    View Details
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
