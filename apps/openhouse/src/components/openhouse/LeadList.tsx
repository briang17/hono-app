import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export interface OpenHouseLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  workingWithAgent: boolean;
  submittedAt: string;
}

interface LeadListProps {
  leads: OpenHouseLead[];
}

export default function LeadList({ leads }: LeadListProps) {
  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No leads yet</p>
            <p className="text-sm">Visitors who sign in will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <Card key={lead.id} className="border-l-4 border-l-[#D0AC61]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base text-[#1C2A52]">
                {lead.firstName} {lead.lastName}
              </CardTitle>
              <Badge variant={lead.workingWithAgent ? "default" : "secondary"}>
                {lead.workingWithAgent ? "Has Agent" : "No Agent"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {lead.email && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="text-[#1C2A52]">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="text-[#1C2A52]">{lead.phone}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-gray-400 text-xs">
                Signed in {formatDistanceToNow(new Date(lead.submittedAt), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
