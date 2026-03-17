import type { CreateTaskInput, Task, UpdateTaskInput } from '@/lib/schemas/task.schema'
import { taskSchema } from '@/lib/schemas/task.schema'

// Mock data - replace with Hono client calls
let tasks: Task[] = [
    {
        id: crypto.randomUUID(),
        title: 'Example Task 1',
        description: 'This is a sample task to demonstrate the CRUD functionality',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: crypto.randomUUID(),
        title: 'Example Task 2',
        description: 'Another sample task for testing',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: crypto.randomUUID(),
        title: 'Example Task 3',
        status: 'done',
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

export const tasksApi = {
    getTasks: async (): Promise<Task[]> => {
        return tasks
    },

    getTask: async (id: string): Promise<Task> => {
        const task = tasks.find((t) => t.id === id)
        if (!task) throw new Error('Task not found')
        return taskSchema.parse(task)
    },

    createTask: async (data: CreateTaskInput): Promise<Task> => {
        const newTask = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        tasks.push(newTask)
        return taskSchema.parse(newTask)
    },

    updateTask: async (id: string, data: UpdateTaskInput): Promise<Task> => {
        const index = tasks.findIndex((t) => t.id === id)
        if (index === -1) throw new Error('Task not found')
        tasks[index] = { ...tasks[index], ...data, updatedAt: new Date() }
        return taskSchema.parse(tasks[index])
    },

    deleteTask: async (id: string): Promise<void> => {
        tasks = tasks.filter((t) => t.id !== id)
    },
}
