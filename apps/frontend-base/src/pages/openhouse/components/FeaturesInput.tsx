import { X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FeaturesInputProps {
    value: string[] | null | undefined
    onChange: (value: string[]) => void
}

export function FeaturesInput({ value, onChange }: FeaturesInputProps) {
    const [inputValue, setInputValue] = useState('')
    const features = value ?? []

    const addFeature = () => {
        const trimmed = inputValue.trim()
        if (trimmed && !features.includes(trimmed)) {
            onChange([...features, trimmed])
            setInputValue('')
        }
    }

    const removeFeature = (index: number) => {
        onChange(features.filter((_, i) => i !== index))
    }

    return (
        <>
            <div className="flex gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addFeature()
                        }
                    }}
                    placeholder="Swimming Pool"
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                    Add
                </Button>
            </div>
            {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {features.map((feature, i) => (
                        <Badge key={feature} variant="secondary" className="gap-1 pr-1">
                            {feature}
                            <button
                                type="button"
                                onClick={() => removeFeature(i)}
                                className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </>
    )
}
