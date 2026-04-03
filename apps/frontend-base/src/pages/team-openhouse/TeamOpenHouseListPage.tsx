import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { isPast, isToday } from 'date-fns'
import { useTeamOpenHouses } from '@/lib/queries/openhouse'
import type { TeamOpenHouse } from '@/lib/schemas/openhouse.schema'
import { TeamOpenHouseCard } from './components/TeamOpenHouseCard'

export function TeamOpenHouseListPage() {
    const navigate = useNavigate()
    const { data: openhouses } = useSuspenseQuery(useTeamOpenHouses())

    const handleViewOpenHouse = (id: string) => {
        navigate({ to: '/openhouse/$openHouseId', params: { openHouseId: id } })
    }

    const groupOpenHouses = (list: TeamOpenHouse[]) => {
        const upcoming: TeamOpenHouse[] = []
        const past: TeamOpenHouse[] = []

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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Open Houses</h1>
                <p className="text-muted-foreground mt-1">All open houses in your organization</p>
            </div>

            {upcoming.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Upcoming</h2>
                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {upcoming.map((oh) => (
                            <TeamOpenHouseCard
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
                    <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {past.map((oh) => (
                            <TeamOpenHouseCard
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
                        <p className="text-muted-foreground">
                            Your team hasn't created any open houses yet.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
