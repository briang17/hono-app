import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { DatePickerSimple } from '@/components/ui/datepicker-simple'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/schemas/task.schema'
import { createTaskSchema } from '@/lib/schemas/task.schema'
import { isFieldInvalid } from '@/lib/utils'

interface TaskFormProps {
    onSubmit: (values: CreateTaskInput | UpdateTaskInput) => Promise<void>
    defaultValues?: CreateTaskInput | UpdateTaskInput
    submitLabel?: string
}

interface SelectOption {
    value: string
    label: string
}

export function TaskForm({ onSubmit, defaultValues, submitLabel = 'Save' }: TaskFormProps) {
    const form = useForm({
        defaultValues: defaultValues || {
            title: '',
            description: '',
            status: 'todo' as const,
            priority: 'medium' as const,
        },
        validators: {
            onSubmit: createTaskSchema,
        },
        onSubmit: async ({ value }) => {
            console.log('FORM ONSUBMIT')
            await onSubmit(value as CreateTaskInput | UpdateTaskInput)
            form.reset()
        },
    })

    const statusOptions: SelectOption[] = [
        { value: 'todo', label: 'To Do' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'done', label: 'Done' },
    ]

    const priorityOptions: SelectOption[] = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ]

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.Field
                name="title"
                validators={{
                    onChange: ({ value }) => {
                        console.log('FIELD TITLE ONCHANGE VALIDATOR TRIGGERED')
                        return !value ? 'Title is required' : undefined
                    },
                }}
            >
                {(field) => {
                    const { invalid, errors } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                            <Input
                                id={field.name}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter task title"
                                className="transition-all duration-200"
                                aria-invalid={invalid}
                            />
                            {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                        </Field>
                    )
                }}
            </form.Field>

            <form.Field name="description">
                {(field) => {
                    const { invalid } = isFieldInvalid(field)
                    return (
                        <Field data-invalid={invalid}>
                            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                            <Textarea
                                id={field.name}
                                value={field.state.value || ''}
                                rows={3}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="Enter task description"
                                aria-invalid={invalid}
                            />
                        </Field>
                    )
                }}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
                <form.Field name="status">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                                <Select
                                    name={field.name}
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(value as CreateTaskInput['status'])
                                    }
                                >
                                    <SelectTrigger aria-invalid={invalid}>
                                        <SelectValue placeholder="Select task status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Task status</SelectLabel>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>

                <form.Field name="priority">
                    {(field) => {
                        const { invalid, errors } = isFieldInvalid(field)
                        return (
                            <Field data-invalid={invalid}>
                                <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                                <Select
                                    name={field.name}
                                    value={field.state.value}
                                    onValueChange={(value) =>
                                        field.handleChange(value as CreateTaskInput['priority'])
                                    }
                                >
                                    <SelectTrigger aria-invalid={invalid}>
                                        <SelectValue placeholder="Select task priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Task priority</SelectLabel>
                                            {priorityOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                            </Field>
                        )
                    }}
                </form.Field>
            </div>

            <form.Field name="dueDate">
                {(field) => (
                    <Field>
                        <FieldLabel htmlFor={field.name}>Due Date (optional)</FieldLabel>
                        <DatePickerSimple value={field.state.value} onSelect={field.handleChange} />
                    </Field>
                )}
            </form.Field>

            <Button type="submit" disabled={form.state.isSubmitting} className="w-full">
                {form.state.isSubmitting ? 'Saving...' : submitLabel}
            </Button>
        </form>
    )
}
