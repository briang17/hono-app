import { useForm } from '@tanstack/react-form'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Camera, Loader2, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FormSubmitError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/api/auth-client'
import { cloudinaryUrl, imagePresets } from '@/lib/cloudinary-url'
import { openCloudinaryUploadWidget } from '@/lib/cloudinary-widget'
import {
    type CreateOrganizationInput,
    createOrganizationSchema,
} from '@/lib/schemas/organization.schema'
import { isFieldInvalid } from '@/lib/utils'

interface LogoState {
    logo: string | null
    logoPublicId: string | null
    smallLogo: string | null
    smallLogoPublicId: string | null
}

export function CreateOrganizationPage() {
    const routeApi = getRouteApi('/(protected)/create-organization')
    const { redirect } = routeApi.useSearch()
    const navigate = useNavigate()
    const { refetch } = authClient.useSession()
    const [uploadingMain, setUploadingMain] = useState(false)
    const [uploadingSmall, setUploadingSmall] = useState(false)
    const [logoState, setLogoState] = useState<LogoState>({
        logo: null,
        logoPublicId: null,
        smallLogo: null,
        smallLogoPublicId: null,
    })

    const defaultOrg: CreateOrganizationInput = {
        name: '',
        slug: '',
        ...logoState,
    }

    const form = useForm({
        defaultValues: defaultOrg,
        validators: {
            onSubmit: createOrganizationSchema,
            onSubmitAsync: async ({ value }) => {
                const { error: err } = await authClient.organization.create({
                    name: value.name,
                    slug: value.slug,
                    logo: value.logo || undefined,
                    logoPublicId: value.logoPublicId || undefined,
                    smallLogo: value.smallLogo || undefined,
                    smallLogoPublicId: value.smallLogoPublicId || undefined,
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

    const handleUploadMainLogo = useCallback(async () => {
        setUploadingMain(true)
        try {
            await openCloudinaryUploadWidget(
                (results) => {
                    const result = results[0]
                    if (!result) return
                    setLogoState((prev) => ({
                        ...prev,
                        logo: result.url,
                        logoPublicId: result.publicId,
                    }))
                    form.setFieldValue('logo', result.url)
                    form.setFieldValue('logoPublicId', result.publicId)
                    setUploadingMain(false)
                },
                (error) => {
                    console.error('Upload failed:', error)
                    setUploadingMain(false)
                },
                { folder: 'org-logos', maxFiles: 1 },
            )
        } catch {
            setUploadingMain(false)
        }
    }, [form])

    const handleUploadSmallLogo = useCallback(async () => {
        setUploadingSmall(true)
        try {
            await openCloudinaryUploadWidget(
                (results) => {
                    const result = results[0]
                    if (!result) return
                    setLogoState((prev) => ({
                        ...prev,
                        smallLogo: result.url,
                        smallLogoPublicId: result.publicId,
                    }))
                    form.setFieldValue('smallLogo', result.url)
                    form.setFieldValue('smallLogoPublicId', result.publicId)
                    setUploadingSmall(false)
                },
                (error) => {
                    console.error('Upload failed:', error)
                    setUploadingSmall(false)
                },
                { folder: 'org-logos', maxFiles: 1 },
            )
        } catch {
            setUploadingSmall(false)
        }
    }, [form])

    return (
        <div className="min-h-screen w-full p-4 bg-muted/20 flex items-center justify-center">
            <Card className="min-w-[300px] max-w-lg shadow-md">
                <CardHeader>
                    <CardTitle>Create Organization</CardTitle>
                    <CardDescription>
                        Set up your organization to start collaborating
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
                        {(onSubmit) =>
                            onSubmit ? (
                                <div className="mb-4 p-2 text-sm text-destructive bg-destructive/10 rounded">
                                    <FormSubmitError error={onSubmit} />
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

                        <div className="space-y-3">
                            <Label>Main Logo (optional)</Label>
                            <div className="flex items-center gap-3">
                                {logoState.logoPublicId ? (
                                    <div className="relative">
                                        <img
                                            src={cloudinaryUrl(
                                                logoState.logoPublicId,
                                                imagePresets.orgLogo,
                                            )}
                                            alt="Main logo"
                                            className="h-12 object-contain border rounded px-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogoState((prev) => ({
                                                    ...prev,
                                                    logo: null,
                                                    logoPublicId: null,
                                                }))
                                                form.setFieldValue('logo', null)
                                                form.setFieldValue('logoPublicId', null)
                                            }}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : null}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUploadMainLogo}
                                    disabled={uploadingMain}
                                >
                                    {uploadingMain ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4 mr-2" />
                                    )}
                                    {logoState.logoPublicId ? 'Change' : 'Upload'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Small Logo (optional)</Label>
                            <p className="text-xs text-muted-foreground">
                                Used on open house flyers. A compact, square version of your logo
                                works best.
                            </p>
                            <div className="flex items-center gap-3">
                                {logoState.smallLogoPublicId ? (
                                    <div className="relative">
                                        <img
                                            src={cloudinaryUrl(
                                                logoState.smallLogoPublicId,
                                                imagePresets.flyerOrgLogo,
                                            )}
                                            alt="Small logo"
                                            className="h-10 object-contain border rounded px-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogoState((prev) => ({
                                                    ...prev,
                                                    smallLogo: null,
                                                    smallLogoPublicId: null,
                                                }))
                                                form.setFieldValue('smallLogo', null)
                                                form.setFieldValue('smallLogoPublicId', null)
                                            }}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : null}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUploadSmallLogo}
                                    disabled={uploadingSmall}
                                >
                                    {uploadingSmall ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4 mr-2" />
                                    )}
                                    {logoState.smallLogoPublicId ? 'Change' : 'Upload'}
                                </Button>
                            </div>
                        </div>

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
