import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { routeTree } from './routeTree.gen'
import './index.css'
import { authClient } from './lib/api/auth-client'
import { queryClient } from './lib/react-query'

const router = createRouter({
    routeTree,
    context: {
        session: {
            data: null,
            isPending: true,
            isRefetching: false,
            error: null,
            refetch: async () => {},
        },
        queryClient,
    },
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

function InnerApp() {
    const session = authClient.useSession()

    return <RouterProvider router={router} context={{ session, queryClient }} />
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <InnerApp />
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
