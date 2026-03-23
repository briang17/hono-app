import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { OpenHouseLead } from '@/lib/schemas/openhouse.schema'

interface LeadListProps {
    leads: OpenHouseLead[]
}

export function LeadList({ leads }: LeadListProps) {
    if (leads.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center text-muted-foreground">
                    <p>No leads collected yet</p>
                    <p className="text-sm mt-1">
                        Share the QR code or sign-in link to start collecting leads.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Phone</TableHead>
                        <TableHead className="hidden md:table-cell">Agent</TableHead>
                        <TableHead className="hidden md:table-cell">Submitted</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow key={lead.id}>
                            <TableCell className="font-medium">
                                {lead.firstName} {lead.lastName}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                {lead.email || '-'}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                {lead.phone || '-'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {lead.workingWithAgent ? 'Yes' : 'No'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                {new Date(lead.submittedAt).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
