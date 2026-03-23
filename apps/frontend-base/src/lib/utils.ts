import type { AnyFieldApi } from '@tanstack/react-form'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isFieldInvalid(field: AnyFieldApi) {
    const fieldMeta = field.getMeta()
    return { invalid: fieldMeta.errors.length > 0, errors: fieldMeta.errors }
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value)
}
