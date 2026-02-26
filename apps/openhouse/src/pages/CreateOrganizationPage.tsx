import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useCreateOrganization, useSetActiveOrganization } from "../features/organization/api/organization.api";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const createOrganizationSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
	slug: z.string().min(2, "Slug must be at least 2 characters").max(50, "Slug must be at most 50 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
});

export default function CreateOrganizationPage() {
	const navigate = useNavigate();
	const createOrg = useCreateOrganization();
	const setActiveOrg = useSetActiveOrganization();

	const form = useForm({
		defaultValues: {
			name: "",
			slug: "",
		},
		onSubmit: async ({ value }) => {
			try {
				const org = await createOrg.mutateAsync(value);

				if (org?.id) {
					await setActiveOrg.mutateAsync(org.id);
				}

				navigate({ to: "/open-houses" });
			} catch (error) {
				console.error("Failed to create organization:", error);
			}
		},
		validatorAdapter: zodValidator(),
	});

	const handleNameChange = (name: string) => {
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "")
			.slice(0, 50);
		form.setFieldValue("slug", slug);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create your organization</CardTitle>
					<p className="text-sm text-gray-600">
						Set up your first organization to start managing open houses
					</p>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
							<form.Field
								name="name"
								validators={{
									onChange: createOrganizationSchema.shape.name,
								}}
							>
								{(field) => (
									<div>
										<Label htmlFor={field.name}>Organization Name *</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => {
												field.handleChange(e.target.value);
												handleNameChange(e.target.value);
											}}
											placeholder="My Real Estate Co."
										/>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 text-sm mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<form.Field
								name="slug"
								validators={{
									onChange: createOrganizationSchema.shape.slug,
								}}
							>
								{(field) => (
									<div>
										<Label htmlFor={field.name}>Slug *</Label>
										<Input
											id={field.name}
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="my-real-estate-co"
										/>
										<p className="text-gray-500 text-sm mt-1">
											Used in your organization URL (lowercase letters, numbers, and hyphens only)
										</p>
										{field.state.meta.errors.length > 0 && (
											<p className="text-red-600 text-sm mt-1">
												{field.state.meta.errors[0]}
											</p>
										)}
									</div>
								)}
							</form.Field>

							<Button
								type="submit"
								className="w-full"
								disabled={createOrg.isPending || setActiveOrg.isPending}
							>
								{createOrg.isPending || setActiveOrg.isPending
									? "Creating..."
									: "Create Organization"}
							</Button>
						</form>
				</CardContent>
			</Card>
		</div>
	);
}
