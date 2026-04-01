import { create } from 'zustand'
import type { FieldType, FormFieldConfig } from '@/lib/schemas/form-builder.schema'

interface FormBuilderState {
    fields: FormFieldConfig[]
    isLoading: boolean
    isDirty: boolean
    selectedFieldId: string | null

    setFields: (fields: FormFieldConfig[]) => void
    addField: (type: FieldType) => void
    updateField: (id: string, updates: Partial<FormFieldConfig>) => void
    removeField: (id: string) => void
    reorderFields: (fromIndex: number, toIndex: number) => void
    selectField: (id: string | null) => void
    reset: () => void
    markSaved: () => void
}

function createDefaultField(type: FieldType): FormFieldConfig {
    const id = crypto.randomUUID()
    const base = { id, type, required: false }

    switch (type) {
        case 'select':
            return { ...base, label: 'New select question', options: [] }
        case 'checkbox':
            return { ...base, label: 'New checkbox question', options: [] }
        case 'radio':
            return { ...base, label: 'New radio question', options: [] }
        case 'range':
            return {
                ...base,
                label: 'New range question',
                validation: { min: 0, max: 100 },
                step: 1,
            }
        case 'text':
            return { ...base, label: 'New text question' }
        case 'textarea':
            return { ...base, label: 'New textarea question' }
        case 'number':
            return { ...base, label: 'New number question' }
        case 'date':
            return { ...base, label: 'New date question' }
    }
}

export const useFormBuilderStore = create<FormBuilderState>()((set) => ({
    fields: [],
    isLoading: false,
    isDirty: false,
    selectedFieldId: null,

    setFields: (fields) => set({ fields, isDirty: false, isLoading: false }),

    addField: (type) =>
        set((state) => ({
            fields: [...state.fields, createDefaultField(type)],
            isDirty: true,
        })),

    updateField: (id, updates) =>
        set((state) => ({
            fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
            isDirty: true,
        })),

    removeField: (id) =>
        set((state) => ({
            fields: state.fields.filter((f) => f.id !== id),
            selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
            isDirty: true,
        })),

    reorderFields: (fromIndex, toIndex) =>
        set((state) => {
            const newFields = [...state.fields]
            const [removed] = newFields.splice(fromIndex, 1)
            newFields.splice(toIndex, 0, removed)
            return { fields: newFields, isDirty: true }
        }),

    selectField: (id) => set({ selectedFieldId: id }),

    reset: () => set({ fields: [], isDirty: false, selectedFieldId: null, isLoading: false }),

    markSaved: () => set({ isDirty: false }),
}))
