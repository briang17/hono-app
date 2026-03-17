import { z } from 'zod/v4'

// Base schema - full task object
export const taskSchema = z.object({
    id: z.uuid(),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'done']),
    priority: z.enum(['low', 'medium', 'high']),
    dueDate: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

// Create variant - only fields user can provide
export const createTaskSchema = taskSchema.pick({
    title: true,
    description: true,
    status: true,
    priority: true,
    dueDate: true,
})

// Update variant - partial, all optional
export const updateTaskSchema = taskSchema
    .pick({
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
    })
    .partial()

// List query params variant
export const taskListQuerySchema = z.object({
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    search: z.string().optional(),
})

// Type exports for use across app
export type Task = z.infer<typeof taskSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskListQuery = z.infer<typeof taskListQuerySchema>
export type TaskStatus = z.infer<typeof taskSchema>['status']
export type TaskPriority = z.infer<typeof taskSchema>['priority']
