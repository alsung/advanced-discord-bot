import { supabase } from './supabaseClient.js';

// Task interface
export interface Task {
    id: number;
    user_id: string;
    description: string;
    assignee: string;
    created_at: string;
}

// Create a new task
export const createTask = async (user_id: string, description: string, assignee: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{ user_id, description, assignee }])
        .select()
        .single();

    if (error) {
        console.error('Error creating task:', error.message);
        throw new Error('Failed to create task');
    }

    return data
};

// Get all tasks for a specific user
export const getUserTasks = async (user_id: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting tasks:', error.message);
        throw new Error('Failed to fetch tasks');
    }

    return data;
};

// Update a task description
export const updateTask = async (task_id: number, newDescription: string) => {
    const { data, error } = await supabase
        .from('tasks')
        .update({ description: newDescription})
        .eq('id', task_id)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error.message);
        throw new Error('Failed to update task');
    }

    return data;
};

// Delete a task
export const deleteTask = async (task_id: number) => {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task_id);

    if (error) {
        console.error('Error deleting task:', error.message);
        throw new Error('Failed to delete task');
    }

    return { success: true, message: 'Task deleted' };
};

