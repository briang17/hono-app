import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateOpenHouse } from '@/lib/mutations/openhouse'
import { CreateOpenHouseForm } from './components/CreateOpenHouseForm'

export function CreateOpenHousePage() {
    const navigate = useNavigate()
    const createOpenHouse = useCreateOpenHouse()

    const handleSubmit = async (values: { [key: string]: unknown }) => {
        const result = await createOpenHouse.mutateAsync(values as never)
        navigate({ to: '/openhouse/$openHouseId', params: { openHouseId: result.id } })
    }

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

            <CreateOpenHouseForm onSubmit={handleSubmit} submitLabel="Create Open House" />
        </div>
    )
}
