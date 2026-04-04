import { Camera, Loader2, Save, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/api/auth-client'
import { cloudinaryUrl, imagePresets } from '@/lib/cloudinary-url'
import { openCloudinaryUploadWidget } from '@/lib/cloudinary-widget'

interface FormState {
    name: string
    logo: string | null
    logoPublicId: string | null
    smallLogo: string | null
    smallLogoPublicId: string | null
}

export function OrganizationSettingsPage() {
    const { data: activeOrg } = authClient.useActiveOrganization()
    const [uploadingMain, setUploadingMain] = useState(false)
    const [uploadingSmall, setUploadingSmall] = useState(false)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState<FormState>(() => ({
        name: activeOrg?.name ?? '',
        logo: activeOrg?.logo ?? null,
        logoPublicId: (activeOrg as any)?.logoPublicId ?? null,
        smallLogo: (activeOrg as any)?.smallLogo ?? null,
        smallLogoPublicId: (activeOrg as any)?.smallLogoPublicId ?? null,
    }))

    const dirty =
        form.name !== (activeOrg?.name ?? '') ||
        form.logoPublicId !== ((activeOrg as any)?.logoPublicId ?? null) ||
        form.smallLogoPublicId !== ((activeOrg as any)?.smallLogoPublicId ?? null)

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const data: Record<string, unknown> = {}
            if (form.name !== (activeOrg?.name ?? '')) data.name = form.name
            if (form.logo !== (activeOrg?.logo ?? null)) data.logo = form.logo
            if (form.logoPublicId !== ((activeOrg as any)?.logoPublicId ?? null)) {
                data.logoPublicId = form.logoPublicId
            }
            if (form.smallLogo !== ((activeOrg as any)?.smallLogo ?? null)) {
                data.smallLogo = form.smallLogo
            }
            if (form.smallLogoPublicId !== ((activeOrg as any)?.smallLogoPublicId ?? null)) {
                data.smallLogoPublicId = form.smallLogoPublicId
            }

            if (Object.keys(data).length === 0) return

            await authClient.organization.update({
                data,
            })
        } catch (err) {
            console.error('Failed to update organization:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleUploadMainLogo = useCallback(async () => {
        setUploadingMain(true)
        try {
            await openCloudinaryUploadWidget(
                (results) => {
                    const result = results[0]
                    if (!result) return
                    setField('logo', result.url)
                    setField('logoPublicId', result.publicId)
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
    }, [])

    const handleUploadSmallLogo = useCallback(async () => {
        setUploadingSmall(true)
        try {
            await openCloudinaryUploadWidget(
                (results) => {
                    const result = results[0]
                    if (!result) return
                    setField('smallLogo', result.url)
                    setField('smallLogoPublicId', result.publicId)
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
    }, [])

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Organization Settings</h1>
                <Button onClick={handleSave} disabled={!dirty || saving}>
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">General</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setField('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={activeOrg?.slug ?? ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">Main Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Your organization logo displayed in the app sidebar and header.
                    </p>
                    <div className="flex items-center gap-3">
                        {form.logoPublicId ? (
                            <div className="relative">
                                <img
                                    src={cloudinaryUrl(form.logoPublicId, imagePresets.orgLogo)}
                                    alt="Main logo"
                                    className="h-14 object-contain border rounded px-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setField('logo', null)
                                        setField('logoPublicId', null)
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
                            {form.logoPublicId ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">Small Logo (Flyer)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        A compact version of your logo used on open house flyers. Replaces your
                        organization name in the flyer header.
                    </p>
                    <div className="flex items-center gap-3">
                        {form.smallLogoPublicId ? (
                            <div className="relative">
                                <img
                                    src={cloudinaryUrl(
                                        form.smallLogoPublicId,
                                        imagePresets.flyerOrgLogo,
                                    )}
                                    alt="Small logo"
                                    className="h-10 object-contain border rounded px-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setField('smallLogo', null)
                                        setField('smallLogoPublicId', null)
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
                            {form.smallLogoPublicId ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
