import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { OpenHouseLead } from '@/lib/schemas/openhouse.schema'

interface LeadListProps {
    leads: OpenHouseLead[]
}

export function LeadList({ leads }: LeadListProps) {
    if (leads.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground text-center">No leads collected yet</p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                        Share the QR code or sign-in link to start collecting leads.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {leads.map((lead) => (
                <Card
                    key={lead.id}
                    className="border-l-4 border-l-re-gold hover:shadow-md transition-all duration-200"
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-base text-re-navy">
                                {lead.firstName} {lead.lastName}
                            </CardTitle>
                            <Badge
                                className={
                                    lead.workingWithAgent
                                        ? 'bg-re-gold text-re-gold-foreground'
                                        : 'bg-muted text-muted-foreground'
                                }
                            >
                                {lead.workingWithAgent ? 'Has Agent' : 'No Agent'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {lead.email && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="text-foreground">{lead.email}</span>
                            </div>
                        )}
                        {lead.phone && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="text-foreground">{lead.phone}</span>
                            </div>
                        )}
                        <div className="pt-2 border-t border-border">
                            <span className="text-muted-foreground text-xs">
                                Signed in{' '}
                                {formatDistanceToNow(new Date(lead.submittedAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
