import { useSuspenseQuery } from '@tanstack/react-query'
import { Camera, Loader2, Save, User } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cloudinaryUrl, imagePresets } from '@/lib/cloudinary-url'
import { openCloudinaryUploadWidget } from '@/lib/cloudinary-widget'
import { useUpdateMyAgent } from '@/lib/mutations/agent'
import { useMyAgent } from '@/lib/queries/agent'
import type { Agent } from '@/lib/schemas/agent.schema'

interface FormState {
    firstName: string
    lastName: string
    phone: string
    imagePublicId: string | null
    imageUrl: string | null
}

function agentToForm(agent: Agent): FormState {
    return {
        firstName: agent.firstName,
        lastName: agent.lastName,
        phone: agent.phone ?? '',
        imagePublicId: agent.imagePublicId ?? null,
        imageUrl: agent.imageUrl ?? null,
    }
}

export function ProfilePage() {
    const { data: agent } = useSuspenseQuery(useMyAgent())
    const updateMyAgent = useUpdateMyAgent()
    const [uploading, setUploading] = useState(false)

    const [form, setForm] = useState<FormState>(() => agentToForm(agent))

    useEffect(() => {
        setForm(agentToForm(agent))
    }, [agent])

    const dirty =
        form.firstName !== agent.firstName ||
        form.lastName !== agent.lastName ||
        (form.phone || null) !== (agent.phone ?? null) ||
        form.imagePublicId !== (agent.imagePublicId ?? null)

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSave = () => {
        const payload: Record<string, unknown> = {}
        if (form.firstName !== agent.firstName) payload.firstName = form.firstName
        if (form.lastName !== agent.lastName) payload.lastName = form.lastName
        if ((form.phone || null) !== (agent.phone ?? null)) payload.phone = form.phone || null
        if (form.imagePublicId !== (agent.imagePublicId ?? null)) {
            payload.imageUrl = form.imageUrl
            payload.imagePublicId = form.imagePublicId
        }
        updateMyAgent.mutate(payload)
    }

    const handleUpload = useCallback(async () => {
        setUploading(true)
        try {
            await openCloudinaryUploadWidget(
                (results) => {
                    const result = results[0]
                    if (!result) return
                    setForm((prev) => ({
                        ...prev,
                        imageUrl: result.url,
                        imagePublicId: result.publicId,
                    }))
                    setUploading(false)
                },
                (error) => {
                    console.error('Upload failed:', error)
                    setUploading(false)
                },
                { folder: 'agent-headshots', maxFiles: 1, cropping: '1:1' },
            )
        } catch {
            setUploading(false)
        }
    }, [])

    const handleRemoveHeadshot = () => {
        setForm((prev) => ({ ...prev, imageUrl: null, imagePublicId: null }))
    }

    const displayPublicId = form.imagePublicId ?? agent.imagePublicId ?? null

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
                <Button onClick={handleSave} disabled={!dirty || updateMyAgent.isPending}>
                    {updateMyAgent.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">Headshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-6">
                        <div className="relative group">
                            {displayPublicId ? (
                                <img
                                    src={cloudinaryUrl(displayPublicId, imagePresets.headshot)}
                                    alt={`${form.firstName} ${form.lastName}`}
                                    className="w-32 h-32 rounded-full object-cover border-2 border-border"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                    <User className="w-12 h-12 text-muted-foreground/50" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Upload a professional headshot. This image appears on your open
                                house flyers next to your name.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4 mr-2" />
                                    )}
                                    {displayPublicId ? 'Change Photo' : 'Upload Photo'}
                                </Button>
                                {displayPublicId && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveHeadshot}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">Contact Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={form.firstName}
                                onChange={(e) => setField('firstName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={form.lastName}
                                onChange={(e) => setField('lastName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={agent.email} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => setField('phone', e.target.value)}
                                placeholder="e.g. (555) 123-4567"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
