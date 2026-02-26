import { useState } from "react";
import { useOpenHouse, useOpenHouseLeads } from "../features/openhouse/api/openhouse.api";
import { useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import QRCodeDisplay from "../components/openhouse/QRCodeDisplay";
import LeadList from "../components/openhouse/LeadList";
import { Copy, ArrowLeft } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function OpenHouseDetailPage() {
  const { id } = useParams({ from: "/_app/open-houses/$id" });
  const { data: openHouse, isLoading, error } = useOpenHouse(id);
  const { data: leads } = useOpenHouseLeads(id);
  const [copied, setCopied] = useState(false);

  const signInUrl = `${window.location.origin}/sign-in/${id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(signInUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !openHouse) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center py-12 text-red-600">Open house not found</div>
      </div>
    );
  }

  const isPast = new Date(openHouse.date) < new Date();

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Button variant="ghost" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl text-[#1C2A52]">{openHouse.propertyAddress}</CardTitle>
            {isPast ? (
              <Badge variant="secondary">Past</Badge>
            ) : (
              <Badge>Upcoming</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {openHouse.listingImageUrl && (
            <img
              src={openHouse.listingImageUrl}
              alt="Listing"
              className="w-full h-48 object-cover rounded-md"
            />
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500">Date</span>
              <span className="text-[#1C2A52] font-medium">{format(new Date(openHouse.date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500">Time</span>
              <span className="text-[#1C2A52] font-medium">{openHouse.startTime} - {openHouse.endTime}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-gray-500">Price</span>
              <span className="text-[#1C2A52] font-medium text-lg">{formatCurrency(Number(openHouse.listingPrice))}</span>
            </div>
            {openHouse.notes && (
              <div className="col-span-2 pt-4 border-t border-gray-100">
                <span className="text-gray-500 text-sm block mb-2">Notes</span>
                <p className="text-[#1C2A52]">{openHouse.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qr">QR & Flyer</TabsTrigger>
          <TabsTrigger value="leads">
            Leads
            {leads && leads.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-[#D0AC61] text-white">
                {leads.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#1C2A52]">Sign-In Link</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-3">
                Share this link with visitors to let them sign in digitally
              </p>
              <div className="flex gap-2">
                <Input
                  value={signInUrl}
                  readOnly
                  className="flex-1 bg-gray-50 border-gray-200"
                />
                <Button onClick={copyLink} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#1C2A52]">Leads Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <div className="text-3xl font-bold text-[#1C2A52]">{leads?.length || 0}</div>
                  <div className="text-sm text-gray-500">Total Leads</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <div className="text-3xl font-bold text-[#D0AC61]">
                    {leads?.filter((l) => l.workingWithAgent).length || 0}
                  </div>
                  <div className="text-sm text-gray-500">Have Agent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4 mt-4">
          <QRCodeDisplay url={signInUrl} address={openHouse.propertyAddress} />
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <LeadList leads={leads || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
