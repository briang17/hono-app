import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isPast, isToday } from 'date-fns'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Can } from '@/components/Can'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useCreateOpenHouse } from '@/lib/mutations/openhouse'
import { useOpenHouses } from '@/lib/queries/openhouse'
import type { CreateOpenHouseInput, OpenHouse } from '@/lib/schemas/openhouse.schema'
import { CreateOpenHouseForm } from './components/CreateOpenHouseForm'
import { OpenHouseCard } from './components/OpenHouseCard'

export function OpenHouseListPage() {
    const navigate = useNavigate()
    const { data: openhouses } = useSuspenseQuery(useOpenHouses())
    const createOpenHouse = useCreateOpenHouse()
    const [createFormOpen, setCreateFormOpen] = useState(false)

    const handleCreateOpenHouse = async (values: CreateOpenHouseInput) => {
        await createOpenHouse.mutateAsync(values)
        setCreateFormOpen(false)
    }

    const handleViewOpenHouse = (id: string) => {
        navigate({ to: '/openhouse/$openHouseId', params: { openHouseId: id } })
    }

    const groupOpenHouses = (list: OpenHouse[]) => {
        const upcoming: OpenHouse[] = []
        const past: OpenHouse[] = []

        list.forEach((oh) => {
            const eventDate = new Date(oh.date)
            if (isPast(eventDate) && !isToday(eventDate)) {
                past.push(oh)
            } else {
                upcoming.push(oh)
            }
        })

        return { upcoming, past }
    }

    const { upcoming, past } = openhouses ? groupOpenHouses(openhouses) : { upcoming: [], past: [] }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Open Houses</h1>
                    <p className="text-muted-foreground mt-1">Manage your open houses</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate({ to: '/openhouse/form-builder' })}
                    >
                        <SlidersHorizontal className="size-4" />
                        Form Builder
                    </Button>
                    <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                        <Can permission={{ openhouse: ['create'] }} fallback={<p></p>}>
                            <DialogTrigger asChild>
                                <Button>New Open House</Button>
                            </DialogTrigger>
                        </Can>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create Open House</DialogTitle>
                            </DialogHeader>
                            <CreateOpenHouseForm
                                onSubmit={handleCreateOpenHouse}
                                submitLabel="Create"
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {upcoming.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Upcoming</h2>
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {upcoming.map((oh) => (
                            <OpenHouseCard
                                key={oh.id}
                                openHouse={oh}
                                onClick={() => handleViewOpenHouse(oh.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {past.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Past</h2>
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {past.map((oh) => (
                            <OpenHouseCard
                                key={oh.id}
                                openHouse={oh}
                                onClick={() => handleViewOpenHouse(oh.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {upcoming.length === 0 && past.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                        <div className="text-4xl mb-4">🏠</div>
                        <h3 className="text-lg font-semibold mb-2">No open houses yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first open house to start collecting leads.
                        </p>
                        <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                            <DialogTrigger asChild>
                                <Button>Create Your First Open House</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create Open House</DialogTitle>
                                </DialogHeader>
                                <CreateOpenHouseForm
                                    onSubmit={handleCreateOpenHouse}
                                    submitLabel="Create"
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
        </div>
    )
}
