import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

export function NavigationProgressBar() {
    const isLoading = useRouterState({ select: (s) => s.isLoading })
    const [visible, setVisible] = useState(false)
    const [phase, setPhase] = useState<'idle' | 'loading' | 'finishing'>('idle')
    const timerRef = useRef<ReturnType<typeof setTimeout>>()

    useEffect(() => {
        if (isLoading) {
            clearTimeout(timerRef.current)
            setVisible(true)
            setPhase('loading')
        } else if (visible) {
            setPhase('finishing')
            timerRef.current = setTimeout(() => {
                setVisible(false)
                setPhase('idle')
            }, 300)
        }

        return () => clearTimeout(timerRef.current)
    }, [isLoading, visible])

    return (
        <div className="h-0.5 w-full shrink-0 overflow-hidden">
            {visible && (
                <div
                    className={`h-full bg-primary ${phase === 'loading' ? 'animate-nav-progress' : 'animate-nav-progress-finish'}`}
                />
            )}
        </div>
    )
}
