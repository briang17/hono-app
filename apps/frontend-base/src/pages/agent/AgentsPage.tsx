import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Can } from '@/components/Can'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    useCreateAgent,
    useDeactivateAgent,
    useDeleteAgent,
    useReactivateAgent,
    useUpdateAgent,
} from '@/lib/mutations/agent'
import { useAgents } from '@/lib/queries/agent'
import type { AgentWithUser, UpdateAgentInput } from '@/lib/schemas/agent.schema'
import { AgentForm } from './components/AgentForm'

function EditAgentDialog({
    agent,
    open,
    onOpenChange,
}: {
    agent: AgentWithUser
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const updateAgent = useUpdateAgent(agent.id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Agent</DialogTitle>
                </DialogHeader>
                <AgentForm
                    mode="edit"
                    defaultValues={agent}
                    mutationFn={(data: UpdateAgentInput) => updateAgent.mutateAsync(data)}
                    onSuccess={() => onOpenChange(false)}
                    submitLabel="Save Changes"
                />
            </DialogContent>
        </Dialog>
    )
}

export function AgentsPage() {
    const { data: agents = [] } = useSuspenseQuery(useAgents())
    const createAgent = useCreateAgent()
    const deleteAgent = useDeleteAgent()

    const [createOpen, setCreateOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<AgentWithUser | null>(null)

    function AgentRow({ agent, onEdit }: { agent: AgentWithUser; onEdit: () => void }) {
        const deactivate = useDeactivateAgent(agent.id)
        const reactivate = useReactivateAgent(agent.id)

        return (
            <TableRow>
                <TableCell className="font-medium text-re-navy">
                    {agent.firstName} {agent.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                <TableCell className="text-muted-foreground">{agent.phone ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{agent.fubId ?? '—'}</TableCell>
                <TableCell>
                    {agent.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-success/10 text-success border-success/20">
                            Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-muted text-muted-foreground border-border">
                            Inactive
                        </span>
                    )}
                </TableCell>
                <TableCell>
                    {agent.userId ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-success/10 text-success border-success/20">
                            Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border bg-warning/10 text-warning border-warning/20">
                            Invitation Pending
                        </span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                        <Can permission={{ agent: ['update'] }}>
                            <Button size="sm" variant="ghost" onClick={onEdit}>
                                Edit
                            </Button>
                        </Can>
                        <Can permission={{ agent: ['deactivate'] }}>
                            {agent.isActive ? (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deactivate.mutate()}
                                    disabled={deactivate.isPending}
                                >
                                    Deactivate
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => reactivate.mutate()}
                                    disabled={reactivate.isPending}
                                >
                                    Reactivate
                                </Button>
                            )}
                        </Can>
                        <Can permission={{ agent: ['delete'] }}>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `Remove ${agent.firstName} ${agent.lastName}?`,
                                        )
                                    )
                                        deleteAgent.mutate(agent.id)
                                }}
                                disabled={deleteAgent.isPending}
                            >
                                Delete
                            </Button>
                        </Can>
                    </div>
                </TableCell>
            </TableRow>
        )
    }

    if (agents.length === 0) {
        return (
            <div className="w-full space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-re-navy">Agents</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your organization's agents
                        </p>
                    </div>
                    <Can permission={{ agent: ['create'] }}>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>Invite Agent</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Invite Agent</DialogTitle>
                                </DialogHeader>
                                <AgentForm
                                    mode="create"
                                    mutationFn={createAgent.mutateAsync}
                                    onSuccess={() => setCreateOpen(false)}
                                    submitLabel="Send Invitation"
                                />
                            </DialogContent>
                        </Dialog>
                    </Can>
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center max-w-md">
                        <div className="text-4xl mb-4">🏢</div>
                        <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Invite your first agent to get started.
                        </p>
                        <Can permission={{ agent: ['create'] }}>
                            <Button onClick={() => setCreateOpen(true)}>Invite Agent</Button>
                        </Can>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-re-navy">Agents</h1>
                    <p className="text-muted-foreground mt-1">Manage your organization's agents</p>
                </div>
                <Can permission={{ agent: ['create'] }}>
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>Invite Agent</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Invite Agent</DialogTitle>
                            </DialogHeader>
                            <AgentForm
                                mode="create"
                                mutationFn={createAgent.mutateAsync}
                                onSuccess={() => setCreateOpen(false)}
                                submitLabel="Send Invitation"
                            />
                        </DialogContent>
                    </Dialog>
                </Can>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-muted-foreground">Name</TableHead>
                        <TableHead className="text-muted-foreground">Email</TableHead>
                        <TableHead className="text-muted-foreground">Phone</TableHead>
                        <TableHead className="text-muted-foreground">FUB ID</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Account</TableHead>
                        <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {agents.map((agent) => (
                        <AgentRow
                            key={agent.id}
                            agent={agent}
                            onEdit={() => setEditTarget(agent)}
                        />
                    ))}
                </TableBody>
            </Table>

            {editTarget && (
                <EditAgentDialog
                    agent={editTarget}
                    open={!!editTarget}
                    onOpenChange={(open) => {
                        if (!open) setEditTarget(null)
                    }}
                />
            )}
        </div>
    )
}
