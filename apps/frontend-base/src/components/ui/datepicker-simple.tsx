import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerSimpleProps {
    onSelect: any
    value: any
}

export function DatePickerSimple({ onSelect, value }: DatePickerSimpleProps) {
    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <Button variant="outline" className="w-full justify-start font-normal">
                    {value ? format(value, 'PPP') : <span>Pick a Date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={value} onSelect={onSelect} defaultMonth={value} />
            </PopoverContent>
        </Popover>
    )
}
