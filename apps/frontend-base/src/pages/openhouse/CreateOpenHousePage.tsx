import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateOpenHouse } from '@/lib/mutations/openhouse'
import { OpenHouseForm } from './components/OpenHouseForm'

export function CreateOpenHousePage() {
    const navigate = useNavigate()
    const createOpenHouse = useCreateOpenHouse()
    const createdId = useRef<string | null>(null)

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/openhouse' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Open Houses
            </Button>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Open House</h1>
                <p className="text-muted-foreground mt-1">
                    Fill in the details for your open house
                </p>
            </div>

            <OpenHouseForm
                mutationFn={async (values) => {
                    const result = await createOpenHouse.mutateAsync(values as never)
                    createdId.current = result.id
                }}
                onSuccess={() => {
                    if (createdId.current) {
                        navigate({
                            to: '/openhouse/$openHouseId',
                            params: { openHouseId: createdId.current },
                        })
                    }
                }}
                submitLabel="Create Open House"
            />
        </div>
    )
}
