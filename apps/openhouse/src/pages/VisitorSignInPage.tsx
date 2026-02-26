import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { usePublicOpenHouse, useCreateOpenHouseLead } from "../features/openhouse/api/openhouse.api";
import { useParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { format } from "date-fns";

const leadFieldValidators = {
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
};

export default function VisitorSignInPage() {
  const { openHouseId } = useParams({ from: "/_public/sign-in/$openHouseId" });
  const { data: openHouse, isLoading } = usePublicOpenHouse(openHouseId);
  const createLead = useCreateOpenHouseLead(openHouseId);
  const [submitted, setSubmitted] = useState(false);

  const [validationError, setValidationError] = useState("");

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      workingWithAgent: false,
    },
    onSubmit: async ({ value }) => {
      setValidationError("");
      if (!value.email && !value.phone) {
        setValidationError("Email or phone is required");
        return;
      }
      try {
        await createLead.mutateAsync(value);
        setSubmitted(true);
      } catch (error) {
        console.error("Failed to submit sign-in", error);
      }
    },
    validatorAdapter: zodValidator(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center">
          <div className="text-[#1C2A52]">Loading...</div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa] p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#D0AC61] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl text-[#1C2A52]">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">You've been signed in successfully.</p>
            <p className="text-sm text-gray-500 mt-2">Feel free to look around!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!openHouse) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="text-center text-red-600">Open house not found</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fafafa] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl text-[#1C2A52]">Sign In</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            {openHouse.propertyAddress}
          </p>
          <p className="text-[#D0AC61] text-sm font-medium">
            {format(new Date(openHouse.date), "MMM d, yyyy")} • {openHouse.startTime} - {openHouse.endTime}
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="firstName"
              validators={{
                onChange: leadFieldValidators.firstName,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>First Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="John"
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
              name="lastName"
              validators={{
                onChange: leadFieldValidators.lastName,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Last Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Doe"
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
              name="email"
              validators={{
                onChange: leadFieldValidators.email,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="john@example.com"
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
              name="phone"
              validators={{
                onChange: leadFieldValidators.phone,
              }}
            >
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Phone</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="tel"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="workingWithAgent">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="w-4 h-4 text-[#D0AC61] border-gray-300 rounded focus:ring-[#D0AC61]"
                  />
                  <Label htmlFor={field.name} className="text-sm">
                    Are you currently working with an agent?
                  </Label>
                </div>
              )}
            </form.Field>

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
