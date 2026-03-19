import { useForm } from '@tanstack/react-form'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/api/auth-client'
import { authSchema } from '@/lib/schemas/auth.schema'

export function LoginPage() {
    const routeApi = getRouteApi('/auth/login')
    const { redirect } = routeApi.useSearch()
    const navigate = useNavigate()
    const { refetch } = authClient.useSession()

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onSubmit: authSchema.signIn,
            onSubmitAsync: async ({ value }) => {
                const { error: err } = await authClient.signIn.email({
                    email: value.email,
                    password: value.password,
                })
                if (err) {
                    throw new Error(err.message ?? 'Login failed')
                }
                await refetch()
            },
        },
        onSubmit: () => {
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
                                    {field.state.meta.errors && (
                                        <p className="text-sm text-destructive">
                                            {field.state.meta.errors.join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </Button>
                            )}
                        </form.Subscribe>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate({ to: '/auth/sign-up', search: { redirect } })}
                        >
                            Sign up
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
