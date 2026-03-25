import { useForm } from '@tanstack/react-form'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/api/auth-client'
import { authSchema } from '@/lib/schemas/auth.schema'

export function SignUpPage() {
    const routeApi = getRouteApi('/auth/sign-up')
    const { redirect, invitationId, email } = routeApi.useSearch()
    const navigate = useNavigate()
    const { refetch } = authClient.useSession()

    const form = useForm({
        defaultValues: {
            name: '',
            email: email ?? '',
            password: '',
            confirmPassword: '',
        },
        validators: {
            onSubmit: authSchema.signUp,
            onSubmitAsync: async ({ value }) => {
                const { error: err } = await authClient.signUp.email({
                    name: value.name,
                    email: value.email,
                    password: value.password,
                })
                if (err) {
                    throw new Error(err.message ?? 'Sign up failed')
                }

                await refetch()
            },
        },
        onSubmit: () => {
            if (invitationId) {
                navigate({ to: `/invite/accept?invitationId=${invitationId}` })
            } else {
                navigate({ to: redirect || '/dashboard' })
            }
        },
    })

    return (
        <div className="min-h-screen w-full p-4 bg-muted/20 flex items-center justify-center">
            <Card className="min-w-[300px] shadow-md">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                    <CardDescription>
                        Enter your information below for a new account
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
                                    !value ? 'Username is required' : undefined,
                            }}
                        >
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Username</Label>
                                    <Input
                                        id={field.name}
                                        type="text"
                                        placeholder="johndoe"
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
                                        disabled={!!email}
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
                        <form.Field name="confirmPassword">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Confirm password</Label>
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
                                    {isSubmitting ? 'Signing up...' : 'Sign Up'}
                                </Button>
                            )}
                        </form.Subscribe>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate({ to: '/auth/login', search: { redirect } })}
                        >
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
