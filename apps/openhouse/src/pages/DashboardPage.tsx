import { useOpenHouses } from "../features/openhouse/api/openhouse.api";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Plus } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function DashboardPage() {
  const { data: openHouses, isLoading, error } = useOpenHouses();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-12 text-red-600">Error loading open houses</div>
      </div>
    );
  }

  const upcomingOpenHouses = openHouses?.filter((oh) => new Date(oh.date) >= new Date()) || [];
  const pastOpenHouses = openHouses?.filter((oh) => new Date(oh.date) < new Date()) || [];

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2A52]">Open Houses</h1>
          <p className="text-gray-600 text-sm mt-1">{openHouses?.length || 0} events</p>
        </div>
        <Button onClick={() => navigate({ to: "/open-houses/new" })}>
          <Plus className="w-4 h-4 mr-2" />
          New Open House
        </Button>
      </div>

      {upcomingOpenHouses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1C2A52] mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcomingOpenHouses.map((oh) => (
              <Card
                key={oh.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-[#D0AC61]"
                onClick={() => navigate({ to: `/open-houses/${oh.id}` })}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#1C2A52]">{oh.propertyAddress}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-[#1C2A52]">{format(new Date(oh.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="text-[#1C2A52]">{oh.startTime} - {oh.endTime}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-gray-500">Price:</span>
                      <span className="text-[#1C2A52] font-medium">{formatCurrency(Number(oh.listingPrice))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {pastOpenHouses.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#1C2A52] mb-3">Past</h2>
          <div className="space-y-3">
            {pastOpenHouses.map((oh) => (
              <Card
                key={oh.id}
                className="cursor-pointer hover:shadow-md transition-shadow opacity-75"
                onClick={() => navigate({ to: `/open-houses/${oh.id}` })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base text-[#1C2A52]">{oh.propertyAddress}</CardTitle>
                    <Badge variant="secondary">Past</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-[#1C2A52]">{format(new Date(oh.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="text-[#1C2A52]">{oh.startTime} - {oh.endTime}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-gray-500">Price:</span>
                      <span className="text-[#1C2A52] font-medium">{formatCurrency(Number(oh.listingPrice))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {openHouses && openHouses.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-2">No open houses yet</p>
          <p className="text-sm text-gray-400 mb-6">Create your first open house to get started</p>
          <Button onClick={() => navigate({ to: "/open-houses/new" })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Open House
          </Button>
        </div>
      )}
    </div>
  );
}
