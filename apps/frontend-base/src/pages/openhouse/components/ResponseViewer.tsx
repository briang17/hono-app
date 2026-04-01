import { format } from 'date-fns'
import type { FormFieldConfig } from '@/lib/schemas/form-builder.schema'
import type { OpenHouseLead } from '@/lib/schemas/openhouse.schema'

interface ResponseViewerProps {
    responses: OpenHouseLead['responses']
    questions: FormFieldConfig[]
}

function formatOptionLabel(question: FormFieldConfig, value: string): string {
    const option = question.options?.find((o) => o.value === value)
    return option?.label ?? value
}

function formatResponseValue(question: FormFieldConfig, value: unknown): string {
    switch (question.type) {
        case 'select':
        case 'radio':
            return typeof value === 'string' ? formatOptionLabel(question, value) : String(value)
        case 'checkbox':
            if (Array.isArray(value)) {
                return value.map((v) => formatOptionLabel(question, String(v))).join(', ')
            }
            return String(value)
        case 'date':
            if (typeof value === 'string' && value) {
                try {
                    return format(new Date(value), 'MMM d, yyyy')
                } catch {
                    return value
                }
            }
            return String(value ?? '')
        case 'range':
            if (Array.isArray(value) && value.length === 2) {
                return `${value[0]} — ${value[1]}`
            }
            return String(value)
        default:
            return String(value ?? '')
    }
}

export function ResponseViewer({ responses, questions }: ResponseViewerProps) {
    if (!responses || Object.keys(responses).length === 0) {
        return null
    }

    const questionsById = new Map(questions.map((q) => [q.id, q]))

    const entries = Object.entries(responses)
        .filter(([questionId]) => questionsById.has(questionId))
        .map(([questionId, value]) => {
            const question = questionsById.get(questionId)!
            return { question, value }
        })

    if (entries.length === 0) {
        return null
    }

    return (
        <div className="space-y-2 pt-2 border-t border-border">
            {entries.map(({ question, value }) => (
                <div key={question.id} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{question.label}</span>
                    <span className="text-foreground text-right">
                        {formatResponseValue(question, value)}
                    </span>
                </div>
            ))}
        </div>
    )
}
