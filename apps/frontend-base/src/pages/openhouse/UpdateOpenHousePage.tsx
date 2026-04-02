import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdateOpenHouse } from '@/lib/mutations/openhouse'
import { useOpenHouse } from '@/lib/queries/openhouse'
import type { UpdateOpenHouseImage, UpdateOpenHouseInput } from '@/lib/schemas/openhouse.schema'
import { OpenHouseForm } from './components/OpenHouseForm'

export function UpdateOpenHousePage() {
    const routeApi = getRouteApi('/(protected)/(organization)/openhouse/$openHouseId/edit')
    const navigate = useNavigate()
    const { openHouseId } = routeApi.useParams()

    const { data: openHouse } = useSuspenseQuery(useOpenHouse(openHouseId))
    const updateOpenHouse = useUpdateOpenHouse(openHouseId)

    const initialValues: UpdateOpenHouseInput = {
        propertyAddress: openHouse.propertyAddress,
        listingPrice: openHouse.listingPrice,
        date: new Date(openHouse.date),
        startTime: openHouse.startTime,
        endTime: openHouse.endTime,
        notes: openHouse.notes ?? '',
        images: openHouse.images.map(
            (img): UpdateOpenHouseImage => ({
                id: img.id,
                publicId: img.publicId,
                url: img.url,
                isMain: img.isMain,
                orderIndex: img.orderIndex,
            }),
        ),
    }

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <Button
                variant="ghost"
                onClick={() =>
                    navigate({
                        to: '/openhouse/$openHouseId',
                        params: { openHouseId },
                    })
                }
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open House
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Open House</h1>
                <p className="text-muted-foreground mt-1">Update the details for your open house</p>
            </div>

            <OpenHouseForm
                mutationFn={async (values) => {
                    await updateOpenHouse.mutateAsync(values as UpdateOpenHouseInput)
                }}
                onSuccess={() => {
                    navigate({
                        to: '/openhouse/$openHouseId',
                        params: { openHouseId },
                    })
                }}
                submitLabel="Save Changes"
                initialValues={initialValues}
            />
        </div>
    )
}
