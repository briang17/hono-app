import { createFileRoute } from '@tanstack/react-router'
import { usePublicOpenHouse } from '@/lib/queries/openhouse'
import { VisitorSignInError, VisitorSignInPage } from '@/pages/openhouse/VisitorSignInPage'

export const Route = createFileRoute('/public/open-houses/sign-in/$openHouseId')({
    loader: async ({ context: { queryClient }, params }) => {
        await queryClient.ensureQueryData(usePublicOpenHouse(params.openHouseId))
    },
    errorComponent: VisitorSignInError,
    component: VisitorSignInPage,
})
