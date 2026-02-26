import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useCreateOpenHouse } from "../features/openhouse/api/openhouse.api";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const createOpenHouseSchema = z.object({
  propertyAddress: z.string().min(1, "Address is required"),
  listingPrice: z.number().positive("Price must be positive"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  listingImageUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export default function CreateOpenHousePage() {
  const navigate = useNavigate();
  const createOpenHouse = useCreateOpenHouse();

  const form = useForm({
    defaultValues: {
      propertyAddress: "",
      listingPrice: 0,
      date: "",
      startTime: "",
      endTime: "",
      listingImageUrl: "",
      notes: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await createOpenHouse.mutateAsync(value);
        navigate({ to: "/open-houses" });
      } catch (error) {
        console.error("Failed to create open house", error);
      }
    },
    validatorAdapter: zodValidator(),
  });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: "/open-houses" })}
          className="text-[#1C2A52] hover:text-[#D0AC61] transition-colors flex items-center text-sm mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Open Houses
        </button>
        <h1 className="text-2xl font-bold text-[#1C2A52]">Create Open House</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6 bg-white p-6 rounded-lg border border-gray-200"
      >
        <form.Field
          name="propertyAddress"
          validators={{
            onChange: createOpenHouseSchema.shape.propertyAddress,
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name} className="block mb-2">
                Property Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="123 Main St, City, State"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="listingPrice"
          validators={{
            onChange: createOpenHouseSchema.shape.listingPrice,
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name} className="block mb-2">
                Listing Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="number"
                step="0.01"
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                placeholder="0.00"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="date"
          validators={{
            onChange: createOpenHouseSchema.shape.date,
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name} className="block mb-2">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="startTime"
            validators={{
              onChange: createOpenHouseSchema.shape.startTime,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className="block mb-2">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="endTime"
            validators={{
              onChange: createOpenHouseSchema.shape.endTime,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name} className="block mb-2">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <form.Field
          name="listingImageUrl"
          validators={{
            onChange: createOpenHouseSchema.shape.listingImageUrl,
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name} className="block mb-2">
                Listing Image URL
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://..."
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  {field.state.meta.errors[0]}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="notes">
          {(field) => (
            <div>
              <Label htmlFor={field.name} className="block mb-2">
                Notes
              </Label>
              <Textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          )}
        </form.Field>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/open-houses" })}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={form.state.isSubmitting}>
            {form.state.isSubmitting ? "Creating..." : "Create Open House"}
          </Button>
        </div>
      </form>
    </div>
  );
}
