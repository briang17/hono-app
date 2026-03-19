import { useForm } from '@tanstack/react-form'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/api/auth-client'
import {
    type CreateOrganizationInput,
    createOrganizationSchema,
    orgSchema,
} from '@/lib/schemas/organization.schema'
import { isFieldInvalid } from '@/lib/utils'

export function CreateOrganizationPage() {
    const routeApi = getRouteApi('/(protected)/create-organization')
    const { redirect } = routeApi.useSearch()
    const navigate = useNavigate()
    const { refetch } = authClient.useSession()

    const defaultOrg: CreateOrganizationInput = {
        name: '',
        slug: '',
        logo: undefined,
    }

    const form = useForm({
        defaultValues: defaultOrg,
        validators: {
            onSubmit: orgSchema.create,
            onSubmitAsync: async ({ value }) => {
                const { error: err } = await authClient.organization.create({
                    name: value.name,
                    slug: value.slug,
                    logo: value.logo || undefined,
                })
                if (err) {
                    throw new Error(err.message ?? 'Failed to create organization')
                }
                await refetch()
            },
        },
        onSubmit: async () => {
            navigate({ to: redirect || '/dashboard' })
        },
    })

    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 50)
        form.setFieldValue('slug', slug)
    }

    return (
        <div className="min-h-screen w-full p-4 bg-muted/20 flex items-center justify-center">
            <Card className="min-w-[300px] shadow-md">
                <CardHeader>
                    <CardTitle>Create Organization</CardTitle>
                    <CardDescription>
                        Set up your organization to start collaborating
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form.Subscribe selector={(state) => state.errorMap}>
                        {(errorMap) =>
                            errorMap.onSubmit ? (
                                <div className="mb-4 p-2 text-sm text-destructive bg-destructive/10 rounded">
                                    {errorMap.onSubmit.toString()}
                                </div>
                            ) : null
                        }
                    </form.Subscribe>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                        className="space-y-4 w-full"
                    >
                        <form.Field
                            name="name"
                            validators={{
                                onChange: ({ value }) =>
                                    !value ? 'Organization name is required' : undefined,
                            }}
                        >
                            {(field) => {
                                const { invalid, errors } = isFieldInvalid(field)
                                return (
                                    <Field data-invalid={invalid}>
                                        <Label htmlFor={field.name}>Organization Name</Label>
                                        <Input
                                            id={field.name}
                                            type="text"
                                            placeholder="My Organization"
                                            value={field.state.value}
                                            onChange={(e) => {
                                                field.handleChange(e.target.value)
                                                handleNameChange(e.target.value)
                                            }}
                                            className="transition-all duration-200"
                                            aria-invalid={invalid}
                                        />
                                        {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                                    </Field>
                                )
                            }}
                        </form.Field>

                        <form.Field
                            name="slug"
                            validators={{
                                onChange: ({ value }) => (!value ? 'Slug is required' : undefined),
                            }}
                        >
                            {(field) => {
                                const { invalid, errors } = isFieldInvalid(field)
                                return (
                                    <Field data-invalid={invalid}>
                                        <Label htmlFor={field.name}>Slug</Label>
                                        <Input
                                            id={field.name}
                                            type="text"
                                            placeholder="my-organization"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="transition-all duration-200"
                                            aria-invalid={invalid}
                                        />
                                        {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                                    </Field>
                                )
                            }}
                        </form.Field>

                        <form.Field name="logo">
                            {(field) => {
                                const { invalid, errors } = isFieldInvalid(field)
                                return (
                                    <div className="space-y-2">
                                        <Label htmlFor={field.name}>Logo URL (optional)</Label>
                                        <Input
                                            id={field.name}
                                            type="url"
                                            placeholder="https://example.com/logo.png"
                                            value={field.state.value ?? ''}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            className="transition-all duration-200"
                                            aria-invalid={invalid}
                                        />
                                        {invalid && <FieldError>{errors.join(', ')}</FieldError>}
                                    </div>
                                )
                            }}
                        </form.Field>

                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Organization'}
                                </Button>
                            )}
                        </form.Subscribe>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
