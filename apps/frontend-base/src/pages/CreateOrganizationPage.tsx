import { useForm } from '@tanstack/react-form'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authSchema } from '@/lib/schemas/auth.schema'

export function CreateOrganizationPage() {
    const routeApi = getRouteApi('/(protected)/create-organization')
    const { redirect } = routeApi.useSearch()
    const navigate = useNavigate()

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onSubmit: authSchema.signIn,
        },
        onSubmit: async () => {
            navigate({ to: redirect || '/dashboard' })
        },
    })

    return (
        <div className="min-h-screen w-full p-4 bg-muted/20 flex items-center justify-center">
            <Card className="min-w-[300px] shadow-md">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                        className="space-y-4 w-full"
                    >
                        <form.Field
                            name="email"
                            validators={{
                                onChange: ({ value }) => (!value ? 'Email is required' : undefined),
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Email</Label>
                                    <Input
                                        id={field.name}
                                        type="email"
                                        placeholder="m@example.com"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="transition-all duration-200"
                                    />
                                    {field.state.meta.errors && (
                                        <p className="text-sm text-destructive">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <form.Field name="password">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Password</Label>
                                    <Input
                                        id={field.name}
                                        type="password"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="transition-all duration-200"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <Button type="submit" className="w-full" disabled={login.isPending}>
                            {login.isPending ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
