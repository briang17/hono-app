import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import './index.css'
import { queryClient } from './lib/react-query'
import { useAuthStore } from './lib/stores/authStore'

const router = createRouter({ routeTree, context: { auth: null, queryClient: queryClient } })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const App = () => {
    const auth = useAuthStore()

    useEffect(() => {
        router.invalidate();
    }, [auth.isAuthenticated])

    useEffect(() => {
        if(!auth.session?.activeOrganizationId) {
            router.invalidate();
        }
    }, [auth.session?.activeOrganizationId])

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} context={{ auth }} />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error("Can't render")

if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
}
